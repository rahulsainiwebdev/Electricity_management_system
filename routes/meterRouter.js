import express from "express";
const router = express.Router();

import { generateBill, registerMeter, viewAllBills, viewUsers } from "../Controller/adminController.js";
import { createOrder, getMyBills, getMyMeter, getUserProfile, updateUser, verifyPayment } from "../Controller/userController.js";
import { loginUser, Signup } from "../Controller/authController.js";
import { authenticateUser } from "../Middleware/authentication.js";

//user
router.get("/getUserProfile",authenticateUser, getUserProfile);
router.get("/getMyBills",authenticateUser, getMyBills);
router.get("/getMyMeter",authenticateUser, getMyMeter);
router.put("/update", authenticateUser, updateUser);



//auth
router.post("/signup", Signup);
router.post("/login", loginUser);



//admin
router.post("/registerMeter",authenticateUser, registerMeter);           //c
router.get("/viewAllBills",authenticateUser, viewAllBills);
router.post("/generateBill",authenticateUser, generateBill);   //c
router.get("/viewUsers",authenticateUser, viewUsers);          //c


// razorpay
// router.post("/markPaid/:billId", authenticateUser, markBillAsPaid);
// router.post("/createOrder", authenticateUser, createRazorpayOrder);

router.post("/razorpay/order", authenticateUser, createOrder);
router.post("/razorpay/verify", authenticateUser, verifyPayment);


export default router;
