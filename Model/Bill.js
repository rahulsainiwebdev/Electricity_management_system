import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
  meterNumber: { type: String, required: true }, // ✅ store string, not ObjectId
  month: { type: String, required: true }, // e.g., "Sep-2025"
  unitsConsumed: { type: Number, required: true },
  slabCharges: [{
    slab: String, // e.g., "0-100 Units"
    units: Number,
    rate: Number,
    amount: Number
  }],
  totalEnergyCharge: { type: Number, required: true },
  additionalCharges: {
    fixedCharges: { type: Number, default: 50 },
    electricityDuty: { type: Number, default: 30 },
    otherCharges: { type: Number, default: 20 }
  },
  netBillAmount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
    paymentInfo: { type: Object },

}, { timestamps: true });

export default mongoose.model("Bill", billSchema);
