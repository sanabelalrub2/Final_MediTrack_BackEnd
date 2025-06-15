import cron from 'node-cron';
import scheduleModel from "../../../DB/models/schedule.model.js";
import userModel from "../../../DB/models/user.model.js";
import { sendEmail } from "../../utils/sendEmail.js";



cron.schedule('*/5 * * * *', async () =>  { // Every hour
  try {
    console.log("🚨 Starting emergency medication check...");

    const users = await userModel.find({}).lean();

    for (const user of users) {
      const schedules = await scheduleModel.find({
        userId: user._id,
        "times.isTaken": false,
      }).lean();

      let missedDoses = 0;
      for (const schedule of schedules) {
        for (const time of schedule.times) {
          if (!time.isTaken) {
            missedDoses++;
          }
        }
      }

      if (missedDoses >= 5 && user.emergencyContacts?.length) {
        console.log(`⚠️ User ${user.userName} has missed ${missedDoses} doses.`);

        for (const contact of user.emergencyContacts) {
          if (contact.email) {
            const html = `
              <h3>🚨 Alert!</h3>
              <p>Patient <strong>${user.userName}</strong> has missed <strong>${missedDoses}</strong> doses of medication.</p>
              <p>Please check on them as soon as possible.</p>
            `;
            await sendEmail(contact.email, "🚨 Alert: Patient missed medication doses", html);

            console.log(`📧 Email sent to ${contact.email} regarding ${user.userName}`);
          }
        }
      }
    }

    console.log("✅ Emergency check completed.");
  } catch (error) {
    console.error("❌ Cron Error:", error);
  }
});
