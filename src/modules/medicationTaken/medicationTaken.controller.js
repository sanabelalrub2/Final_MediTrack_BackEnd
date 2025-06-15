import MedicationTakenModel from "../../../DB/models/medicationTaken.model.js";
 import MedicationModel from "../../../DB/models/medication.model.js";
 
 

// Get all records for the logged-in user
export const getAllMedicationTaken = async (req, res) => {
  const records = await MedicationTakenModel
    .find({ userId: req.user.id })
    .populate("medicationId")
    .populate("scheduleId");

  res.json({ message: "Done", records });
};

// ✅ تعديل createMedicationTaken ليُسجل فقط دون خصم الكمية
export const createMedicationTaken = async (req, res) => {
  try {
    const { medicationId, scheduleId, quantityTaken } = req.body;
    const userId = req.user.id;

    // فقط تحقق أن الدواء موجود ويخص المستخدم
    const medicationExists = await MedicationModel.findOne({ _id: medicationId, userId });
    if (!medicationExists) return res.status(404).json({ message: "Medication not found" });

    // إنشاء السجل بدون خصم الكمية
    const record = await MedicationTakenModel.create({
      medicationId,
      scheduleId,
      quantityTaken,
      userId,
    });

    res.json({
      message: "Medication taken recorded",
      record,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Update only user's own record
export const updateMedicationTaken = async (req, res) => {
  const { id } = req.params;
  const updated = await MedicationTakenModel.findOneAndUpdate(
    { _id: id, userId: req.user.id },
    req.body,
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: "Not found or unauthorized" });
  res.json({ message: "Updated", updated });
};

// Delete only user's own record
export const deleteMedicationTaken = async (req, res) => {
  const { id } = req.params;
  const deleted = await MedicationTakenModel.findOneAndDelete({ _id: id, userId: req.user.id });
  if (!deleted) return res.status(404).json({ message: "Not found or unauthorized" });
  res.json({ message: "Deleted" });
};

// Get records in date range for this user
export const getMedicationTakenInRange = async (req, res) => {
  const { startDate, endDate } = req.query;
  const records = await MedicationTakenModel.find({
    userId: req.user.id,
    takenAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  });
  res.json({ message: "Done", records });
};
