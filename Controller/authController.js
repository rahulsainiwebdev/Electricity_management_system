import MeterUser from "../Model/Signup.js";
import jwt from "jsonwebtoken";

// ---------------- SIGNUP ----------------
export const Signup = async (req, res) => {
  try {
    let { name, email, username, password, role, contact, address, meterNumber } = req.body;

    // Required fields check
    if (!name || !email || !username || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Normalize input
    username = username.toLowerCase().trim();
    email = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await MeterUser.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Create user — password will be hashed automatically
    const user = await MeterUser.create({ 
      name, email, username, password, role: role || "user",
      contact, address, meterNumber
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      username: user.username,
      role: user.role
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- LOGIN ----------------
export const loginUser = async (req, res) => {
  try {
    let { username, password } = req.body;
    username = username.toLowerCase().trim(); // normalize input

    const user = await MeterUser.findOne({ username });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid username or password" });
    }

    // Compare password using schema method
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid username or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ 
      success: true, 
      token, 
      user: {
        username: user.username,
        role: user.role,
      }, 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
