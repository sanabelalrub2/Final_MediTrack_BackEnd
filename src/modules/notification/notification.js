import cron from "node-cron";
import scheduleModel from "../../../DB/models/schedule.model.js";
import NotificationModel from "../../../DB/models/notification.model.js";
import { sendNotification } from "../../utils/sendNotification.js";

cron.schedule("* * * * *", async () => {
  const now = new Date();
  console.log("🔍 [CRON] Local server time:", now.toLocaleString());

  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const today = daysOfWeek[now.getDay()];

  const schedules = await scheduleModel
    .find({
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
    .populate("medicationId")
    .populate("userId");

  console.log(`📋 Found ${schedules.length} active schedules`);

  for (const schedule of schedules) {
    const frequencyArray = schedule.frequency || [];

    const isTodayIncluded = frequencyArray.includes("daily") || frequencyArray.includes(today);
    if (!isTodayIncluded) continue;

    // تأكد من وجود بيانات مهمة
    if (!schedule.medicationId || !schedule.userId) {
      console.log(`⚠️ Missing medication or user info for schedule ${schedule._id}`);
      continue;
    }

    let modified = false; // علم لتحديد ما إذا تم التعديل على أي timeEntry

    for (const timeEntry of schedule.times) {
      const [hour, minute] = timeEntry.time.split(":").map(Number);
      const medTime = new Date(now);
      medTime.setHours(hour, minute, 0, 0);

      const timeDiff = (medTime - now) / 60000;

      console.log(`🔄 Checking med at ${timeEntry.time}, time diff = ${timeDiff.toFixed(2)} min`);

      // تعديل الشرط ليشمل الوقت الحالي وحتى 5 دقائق بعد الموعد
      if (timeDiff >= 0 && timeDiff <= 5) {
        const lastNotified = timeEntry.lastNotifiedAt ? new Date(timeEntry.lastNotifiedAt) : new Date(0);
        const minutesSinceLast = (now - lastNotified) / 60000;

        console.log(`⌛ Last notification for this time was ${minutesSinceLast.toFixed(2)} minutes ago`);

        if (minutesSinceLast >= 2) {
          const fcmToken = schedule.userId?.fcmToken;
          if (!fcmToken) {
            console.log(`⚠️ No FCM token for user ${schedule.userId._id}`);
            continue;
          }

          const title = "💊 Medication Reminder";
          const body = `Medication: ${schedule.medicationId.name}\nDose: ${schedule.dose}\nTime: ${timeEntry.time}`;
          const data = {
            medication_id: schedule.medicationId._id.toString(),
            dosage: schedule.dose,
            time: timeEntry.time,
            schedule_id: schedule._id.toString(),
          };

          try {
            console.log("🚀 Sending notification...");
            await sendNotification(fcmToken, title, body, data);
            console.log("✅ Notification sent");

            await NotificationModel.create({
              userId: schedule.userId._id,
              title,
              body,
              data,
            });

            timeEntry.lastNotifiedAt = now;
            modified = true;
          } catch (err) {
            console.error("❌ Failed to send notification:", err.message);
          }
        }
      }

      // Reset lastNotifiedAt if the time has passed by more than 5 minutes
      if (now - medTime > 5 * 60000 && timeEntry.lastNotifiedAt) {
        timeEntry.lastNotifiedAt = null;
        modified = true;
        console.log("🔁 Reset lastNotifiedAt for outdated time entry");
      }
    }

    if (modified) {
      schedule.markModified("times");
      await schedule.save();
    }
  }
});
