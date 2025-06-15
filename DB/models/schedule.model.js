// DB/models/schedule.model.js
import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  medicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medication",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  days: {
  type: [String], // أمثلة: ["Saturday", "Monday"]
  required: true
},

  frequency: {
    type: [String], // optional, used only if frequency === "custom"
    default: []
  },
  timesPerDay: {
    type: String,  
    required: true
  },dose: {  // <--- هنا جرعة الدواء في كل مرة
    type: Number,
    required: true,
    default: 1
  },
times: [{
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // ✅ أضف هذا السطر
  time: { type: String, required: true },
  isTaken: { type: Boolean, default: false },
}],

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

const scheduleModel = mongoose.model("Schedule", scheduleSchema);
export default scheduleModel;
