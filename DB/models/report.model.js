import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema({
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Medication", required: true },
  adherenceRate: { type: Number, required: true },
  missedDoses: { type: Number, required: true },
  takenDoses: { type: Number, required: true },
  totalScheduledDoses: { type: Number, required: true },
});

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  medications: [medicationSchema],
  createdAt: { type: Date, default: Date.now }
});

const ReportModel = mongoose.model("Report", reportSchema);
export default ReportModel;
