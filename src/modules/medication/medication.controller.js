import medicationModel from "../../../DB/models/medication.model.js";
import scheduleModel from "../../../DB/models/schedule.model.js"
// Get all medications for logged-in user
export const getAllMedications = async (req, res) => {
  const meds = await medicationModel.find({ userId: req.user.id }).populate('userId');
  res.status(200).json({ message: "All medications", medications: meds });
};

// Get medication by ID
export const getMedicationById = async (req, res) => {
  const med = await medicationModel.findOne({ _id: req.params.id, userId: req.user.id });
  if (!med) return res.status(404).json({ message: "Medication not cc" });
  res.status(200).json({ medication: med });
};

// Create new medication
export const createMedication = async (req, res) => {

  const { name, totalQuantity, remainingQuantity, sideEffect, note } = req.body;
  const status = remainingQuantity === 0 ? 'out_of_stock' : 'available';
  const med = await medicationModel.create({ userId: req.user.id, name, totalQuantity, remainingQuantity, status, sideEffect, note });
  res.status(201).json({ message: "Medication created", medication: med });
};

// Update medication
export const updateMedication = async (req, res) => {
  const { name, totalQuantity, remainingQuantity, sideEffect, note } = req.body;
  const status = remainingQuantity === 0 ? 'out_of_stock' : 'available';

  const med = await medicationModel.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { name, totalQuantity, remainingQuantity, status, sideEffect, note },
    { new: true }
  );

  if (!med) return res.status(404).json({ message: "Medication not found" });
  res.status(200).json({ message: "Updated", medication: med });
};

// Delete medicationimport scheduleModel from "../../../DB/models/schedule.model.js";

// عند حذف دواء امسح كل الجداول المرتبطة به
export const deleteMedication = async (req, res) => {
  try {
    const deletedMedication = await medicationModel.findByIdAndDelete(req.params.id,{
      
      userId: req.user.id,
    });
    
    if (!deletedMedication) {
      return res.status(404).json({ message: "Medication not found or not yours" });
    }

    // حذف الجداول المرتبطة بهذا الدواء
    // const schedules=await scheduleModel.find({medicationId: req.params.id})
    await scheduleModel.deleteMany({ medicationId: req.params.id });
    res.json({ message: "Medication and related schedules deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get medications that are out of stock
export const getCartMedications = async (req, res) => {
  const meds = await medicationModel.find({ userId: req.user.id, status: 'out_of_stock' });
  res.status(200).json({ message: "Out of stock medications", medications: meds });
};
