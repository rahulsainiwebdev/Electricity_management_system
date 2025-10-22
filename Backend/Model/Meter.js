import mongoose from "mongoose";

const meterSchema = new mongoose.Schema({
  meterNumber: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "MeterUser" },
  previousReading: { type: Number, default: 0 },
  currentReading: { type: Number, default: 0 },
  ratePerUnit: { type: Number, default: 5 }, // basic rate
}, { timestamps: true });

export default mongoose.model("Meter", meterSchema);
