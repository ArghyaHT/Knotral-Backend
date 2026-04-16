import otpGenerator from "otp-generator";
import { TempUsers } from "../models/tempUsers.js";
import { sendOtpEmail } from "../utils/emailSender.js";
import { Users } from "../models/user.js";

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    const existingUser = await Users.findOne({ email });

   if (existingUser) {
  if (existingUser.authType === "google") {
    return res.status(400).json({
      success: false,
      message: "Email already registered with Google",
    });
  }

  if (existingUser.authType === "local") {
    return res.status(400).json({
      success: false,
      message: "Email already registered with email and password",
    });
  }
}

    const otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });

    // 🔥 Expiry (5 minutes)
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // 🔥 Check if already exists
    let user = await TempUsers.findOne({ email });

    if (user) {
      // Optional: rate limit (30 sec)
      const diff = Date.now() - new Date(user.updatedAt).getTime();
      if (diff < 30 * 1000) {
        return res.json({
          success: false,
          message: "Please wait before requesting another OTP",
        });
      }

      // Update existing record
      user.otp = otp;
      user.otpExpires = otpExpires;
      user.isVerified = false;
      await user.save();
    } else {
      // Create new record
      await TempUsers.create({
        email,
        otp,
        otpExpires,
      });
    }

    await sendOtpEmail(email, otp)


    res.json({ success: true, message: "OTP sent successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.json({ success: false, message: "Email & OTP required" });
    }

    const user = await TempUsers.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // ❌ OTP mismatch
    if (user.otp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // ⏰ Expired
    if (user.otpExpires < new Date()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    await TempUsers.updateOne(
      { email },
      {
        $set: { isVerified: true },
        $unset: { otp: "", otpExpires: "" },
      }
    );

    await user.save();

    res.json({ success: true, message: "Email verified successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};