import ReportModel from "../../../DB/models/report.model.js";
import MedicationTakenModel from "../../../DB/models/medicationTaken.model.js";
import MedicationModel from "../../../DB/models/medication.model.js";
import ScheduleModel from "../../../DB/models/schedule.model.js";
export const generateAdherenceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const userId = req.user.id;

    // احضر كل الأدوية الخاصة بالمستخدم
    const medications = await MedicationModel.find({ userId });

    const reportMedications = [];

    for (const med of medications) {
      const medicationId = med._id;
      console.log('MedicationId:', medicationId);
      console.log('UserId:', userId);
      console.log('StartDate:', new Date(startDate));
      console.log('EndDate:', new Date(endDate));


      // احضر كل الجداول الخاصة بهذا الدواء ضمن الفترة
      const schedules = await ScheduleModel.find({
        medicationId,
        userId,
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
      });

      let totalScheduledDoses = 0;

      for (const schedule of schedules) {
        const from = new Date(Math.max(new Date(schedule.startDate), new Date(startDate)));
        const to = new Date(Math.min(new Date(schedule.endDate), new Date(endDate)));

        const days = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;
        totalScheduledDoses += days * schedule.timesPerDay;
      }

      // احضر عدد الجرعات المأخوذة فعليا
      const takenDoses = await MedicationTakenModel.countDocuments({
        medicationId,
        userId,
        takenAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      });

      const missedDoses = Math.max(totalScheduledDoses - takenDoses, 0);
      const adherenceRate = totalScheduledDoses > 0 ? (takenDoses / totalScheduledDoses) * 100 : 0;

      reportMedications.push({
        medicationId,
        adherenceRate,
        missedDoses,
        takenDoses,
        totalScheduledDoses,
      });
    }

    const newReport = await ReportModel.create({
      userId,
      startDate,
      endDate,
      medications: reportMedications,
    });
    const report=await ReportModel.findById(newReport._id).populate('medications.medicationId');

    res.status(201).json({ message: "Adherence report generated", report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


//  export const createReport = async (req, res) => {
//   try {
//     const report = await ReportModel.create({ ...req.body, userId: req.user.id });
//     res.status(201).json({ message: "Created", report });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

export const getReportById = async (req, res) => {
  const { id } = req.params;

  const report = await ReportModel.findOne({ _id: id, userId: req.user.id });
  if (!report) return res.status(404).json({ message: "Report not found" });
  res.json({ message: "Done", report });
};

export const getAllReports = async (req, res) => {
  try {
    const reports = await ReportModel.find({ userId: req.user.id })
      .populate('medications.medicationId'); // populate the nested medicationId

    res.json({ message: "Done", reports });
  } catch (err) {
    res.status(500).json({ message: "Error fetching reports", error: err.message });
  }
};
