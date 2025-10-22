import MeterUser from "../Model/Signup.js";
import Meter from "../Model/Meter.js";
import Bill from "../Model/Bill.js";
import Razorpay from "razorpay"; // optional, only if you create orders server-side

// Register a meter for a user
export const registerMeter = async (req, res) => {
  try {
    const { meterNumber, userId, previousReading, ratePerUnit } = req.body;
    const meter = new Meter({ meterNumber, userId, previousReading, ratePerUnit });
    await meter.save();
    res.status(201).json({ message: "Meter registered", meter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Generate Bill
export const generateBill = async (req, res) => {
  try {
    const { meterNumber, month, slabCharges, additionalCharges, dueDate, unitsConsumed } = req.body;

    // Find meter
    const meter = await Meter.findOne({ meterNumber });
    if (!meter) return res.status(404).json({ message: "Meter not found" });

    // Use unitsConsumed directly from frontend
    const totalEnergyCharge = slabCharges.reduce((sum, slab) => sum + slab.amount, 0);

    const netBillAmount =
      totalEnergyCharge +
      (additionalCharges.fixedCharges || 0) +
      (additionalCharges.electricityDuty || 0) +
      (additionalCharges.otherCharges || 0);

    const bill = new Bill({
      meterNumber,
      month,
      unitsConsumed, // ✅ directly from frontend
      slabCharges,
      totalEnergyCharge,
      additionalCharges,
      netBillAmount,
      dueDate
    });

    await bill.save();

    res.status(201).json({ message: "Bill generated successfully", bill });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// View all bills (Admin)
export const viewAllBills = async (req, res) => {
  try {
    const bills = await Bill.find().populate("meterNumber");
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View all users
export const viewUsers = async (req, res) => {
  try {
    const users = await MeterUser.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
