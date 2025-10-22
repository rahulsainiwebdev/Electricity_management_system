

import MeterUser from "../Model/Signup.js";
import Meter from "../Model/Meter.js";
import Bill from "../Model/Bill.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// ✅ Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await MeterUser.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ---------------- UPDATE USER ----------------
export const updateUser = async (req, res) => {
  try {
    const userId = req.user.id; // user ID from auth middleware
    const { name, email, contact, address, meterNumber, password } = req.body;

    // Fetch the user
    const user = await MeterUser.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase().trim();
    if (contact) user.contact = contact;
    if (address) user.address = address;
    if (meterNumber) user.meterNumber = meterNumber;
    if (password) user.password = password; // will be hashed automatically if schema has pre-save

    // Save changes
    await user.save();

    res.status(200).json({
      success: true,
      message: "User information updated successfully",
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        contact: user.contact,
        address: user.address,
        meterNumber: user.meterNumber,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




// ✅ Get user's meter details
export const getMyMeter = async (req, res) => {
  try {
    const user = await MeterUser.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const meter = await Meter.findOne({ meterNumber: user.meterNumber });
    if (!meter) return res.status(404).json({ message: "Meter not found" });

    res.json(meter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Get user's bills
export const getMyBills = async (req, res) => {
  try {
    const user = await MeterUser.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const meter = await Meter.findOne({ meterNumber: user.meterNumber });
    if (!meter) return res.status(404).json({ message: "Meter not found" });

    const bills = await Bill.find({ meterNumber: meter.meterNumber });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    const { amount, billId } = req.body;
    if (!amount || !billId)
      return res.status(400).json({ message: "Amount and billId required" });

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: `receipt_${billId}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      key: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Verify payment and mark bill paid
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      billId,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (expectedSign === razorpay_signature) {
      const bill = await Bill.findById(billId);
      if (!bill) return res.status(404).json({ message: "Bill not found" });

      bill.status = "paid";
      bill.paymentInfo = {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        paidAt: new Date(),
      };

      await bill.save();

      res.json({ success: true, message: "Payment verified and bill paid", bill });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: error.message });
  }
};

