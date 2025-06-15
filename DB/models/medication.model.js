import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  totalQuantity: { type: Number, required: true },
  remainingQuantity: { type: Number, required: true },
  status: { type: String, enum: ['available', 'out_of_stock'], default: 'available' },
  sideEffect: { type: String },
  note: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const medicationModel = mongoose.model("Medication", medicationSchema);
export default medicationModel;
