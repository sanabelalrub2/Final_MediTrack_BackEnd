import scheduleModel from "../../../DB/models/schedule.model.js";
import UserModel from "../../../DB/models/user.model.js";
import mongoose from "mongoose";
import MedicationTakenModel from "../../../DB/models/medicationTaken.model.js";

// Get all schedules for the authenticated user
export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await scheduleModel
      .find({ userId: req.user.id })
      .populate("userId")
      .populate("medicationId");

    // فلترة الجداول التي الدواء فيها غير موجود (null)
    const filteredSchedules = schedules.filter(schedule => schedule.medicationId !== null);

    res.json({ message: "All schedules", schedules: filteredSchedules });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get a specific schedule by ID (only if it belongs to the user)
export const getScheduleById = async (req, res) => {
  try {
    const schedule = await scheduleModel.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate("medicationId");

    if (!schedule)
      return res.status(404).json({ message: "Schedule not found or not yours" });

    res.json({ schedule });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const createSchedule = async (req, res) => {
  const { medicationId, frequency, timesPerDay, startDate, endDate, times, dose } = req.body;

  if (!medicationId || !frequency || !timesPerDay || !startDate || !endDate || !times || !dose) {
    return res.status(400).json({ message: "Missing required fields including dose" });
  }

  const newStartDate = new Date(startDate);
  newStartDate.setHours(0, 0, 0, 0);

  const newEndDate = new Date(endDate);
  newEndDate.setHours(23, 59, 59, 999);
  // باقي الكود بدون تغيير

  const schedule = await scheduleModel.create({
    userId: req.user.id,
    medicationId,
    frequency,
    timesPerDay,
    startDate: newStartDate,
    endDate: newEndDate,
    times,
    dose // خزن الجرعة في الجدول
  });

  res.status(201).json({ message: "Schedule created", schedule });
};




// Update a schedule (only if it belongs to the user)
export const updateSchedule = async (req, res) => {
  try {
    const updated = await scheduleModel.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated)
      return res.status(404).json({ message: "Schedule not found or not yours" });

    res.json({ message: "Updated", schedule: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a schedule (only if it belongs to the user)
export const deleteSchedule = async (req, res) => {
  try {
    const deleted = await scheduleModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted)
      return res.status(404).json({ message: "Schedule not found or not yours" });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get schedules active today (based on date range)
// export const getTodaySchedules = async (req, res) => {
//   try {
//     const today = new Date();
//     // البحث عن الجداول التي تشمل التاريخ اليوم ضمن startDate و endDate
//     const schedules = await scheduleModel.find({
//       userId: req.user.id,
//       startDate: { $lte: today },
//       endDate: { $gte: today },
//     }).populate("medicationId").populate("se");

//     res.json({ message: "Today's schedules", schedules });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };



export const getTodaySchedules = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schedules = await scheduleModel.find({
      userId: req.user.id,
      startDate: { $lte: today },
      endDate: { $gte: today },
    })
      .populate("userId")
      .populate("medicationId");

    // تصفية الجداول التي الدواء فيها موجود فقط
    const filteredSchedules = schedules.filter(schedule => schedule.medicationId !== null);

    res.json({ message: "Today's schedules", schedules: filteredSchedules });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

////////////////////////////////////////

export const updateScheduleTime = async (req, res) => {
  const scheduleId = req.params.id;
  const { timeId, isTaken } = req.body;

  if (!timeId || typeof isTaken !== "boolean") {
    return res.status(400).json({ message: "timeId and isTaken are required" });
  }

  try {
    const objectTimeId = new mongoose.Types.ObjectId(timeId);

    // جلب الموعد والتحقق من وجود الوقت
    const schedule = await scheduleModel.findById(scheduleId).populate("medicationId");
    if (!schedule || !schedule.medicationId) {
      return res.status(404).json({ message: "Schedule or Medication not found" });
    }

    const timeEntry = schedule.times.find(t => t._id.toString() === timeId);
    if (!timeEntry) {
      return res.status(404).json({ message: "Time entry not found" });
    }

    if (timeEntry.isTaken === isTaken) {
      return res.status(400).json({ message: "No change in status" });
    }

    const quantityTaken = schedule.dose;
    const medication = schedule.medicationId;

    // تحديث الحالة داخل المصفوفة times
    const result = await scheduleModel.updateOne(
      { _id: scheduleId, "times._id": objectTimeId },
      { $set: { "times.$[elem].isTaken": isTaken } },
      { arrayFilters: [{ "elem._id": objectTimeId }] }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Failed to update time status" });
    }

    if (isTaken === true) {
      if (medication.remainingQuantity < quantityTaken) {
        return res.status(400).json({ message: "Not enough medication remaining" });
      }

      medication.remainingQuantity -= quantityTaken;
      medication.status = medication.remainingQuantity === 0 ? "out_of_stock" : "available";
      await medication.save();

      await MedicationTakenModel.create({
        medicationId: medication._id,
        scheduleId: schedule._id,
        quantityTaken,
        userId: req.user.id,
      });

    } else {
      // إرجاع الجرعة في حال التراجع عن تناولها
      medication.remainingQuantity += quantityTaken;
      medication.status = "available";
      await medication.save();

      await MedicationTakenModel.deleteOne({
        medicationId: medication._id,
        scheduleId: schedule._id,
        userId: req.user.id,
      });
    }

    res.json({ message: "Time status updated successfully" });

  } catch (error) {
    console.error("Error in updateScheduleTime:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// export const updateScheduleTime = async (req, res) => {
//   const scheduleId = req.params.id;
//   const { timeId, isTaken } = req.body;

//   if (!timeId || typeof isTaken !== "boolean") {
//     return res.status(400).json({ message: "timeId and isTaken are required" });
//   }

//   try {
//     const objectTimeId = new mongoose.Types.ObjectId(timeId);

//     // تحديث isTaken للوقت المحدد داخل المصفوفة times
//     const result = await scheduleModel.updateOne(
//       { _id: scheduleId, "times._id": objectTimeId },
//       { $set: { "times.$[elem].isTaken": isTaken } },
//       { arrayFilters: [{ "elem._id": objectTimeId }] }
//     );

//     if (result.modifiedCount === 0) {
//       return res.status(404).json({ message: "Time entry not found or already set" });
//     }

//     // إذا تم تعيين isTaken إلى true
//     if (isTaken === true) {
//       const schedule = await scheduleModel.findById(scheduleId).populate("medicationId");
//       if (!schedule || !schedule.medicationId) {
//         return res.status(404).json({ message: "Schedule or Medication not found" });
//       }

//       const medication = schedule.medicationId;
//       const quantityTaken = schedule.dose;  // الجرعة من جدول الموعد (dose)

//       if (medication.remainingQuantity < quantityTaken) {
//         return res.status(400).json({ message: "Not enough medication remaining" });
//       }

//       // طرح الجرعة من الكمية المتبقية
//       medication.remainingQuantity -= quantityTaken;
//       medication.status = medication.remainingQuantity === 0 ? "out_of_stock" : "available";
//       await medication.save();

//       // إنشاء سجل MedicationTaken جديد
//       await MedicationTakenModel.create({
//         medicationId: medication._id,
//         scheduleId: schedule._id,
//         quantityTaken,
//         userId: req.user.id,
//       });
//     } else {
//       const schedule = await scheduleModel.findById(scheduleId).populate("medicationId");
//       if (!schedule || !schedule.medicationId) {
//         return res.status(404).json({ message: "Schedule or Medication not found" });
//       }

//       const medication = schedule.medicationId;
//       const quantityTaken = schedule.dose;  // الجرعة من جدول الموعد (dose)



//       // طرح الجرعة من الكمية المتبقية
//       medication.remainingQuantity += quantityTaken;
//       await medication.save();

//       // إنشاء سجل MedicationTaken جديد
//       await MedicationTakenModel.deleteOne({
//         medicationId: medication._id,
//         scheduleId: schedule._id,
//         quantityTaken,
//         userId: req.user.id,
//       });

//     }

//     res.json({ message: "Time status updated successfully" });

//   } catch (error) {
//     console.error("Error in updateScheduleTime:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
