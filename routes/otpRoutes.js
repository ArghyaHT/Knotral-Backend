import express from "express";
import { sendForgetPasswordOtp, sendOtp, verifyOtp } from "../controller/sendAndVerifyOtpController.js";

const router = express.Router();

// 🔥 Send OTP
router.post("/send-otp", sendOtp);

router.post("/send-forget-password-otp", sendForgetPasswordOtp);


// 🔥 Verify OTP
router.post("/verify-otp", verifyOtp);

export default router;