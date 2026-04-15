import { validateEmail } from "../middlewares/validator.js";
import { TempUsers } from "../models/tempUsers.js";
import { Users } from "../models/user.js";
import { createAllUsers, createUser, findAdminByEmailandRole, findUserByEmail } from "../services/userService.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { findUserWebinarRegistrations, findUserWebinars } from "../services/userWebinarRegistrationsService.js";
import { getOAuthClient } from "../utils/google.js";
import { google } from "googleapis";

export const registerSuperAdmin = async (req, res, next) => {
  try {
    let { email, password, isSuperAdmin } = req.body;

    if (!email && !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password not found",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is not present",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is not present",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    email = email.toLowerCase();

    const existingUser = await findAdminByEmailandRole(email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createUser(email, hashedPassword, isSuperAdmin);

    return res.status(200).json({
      success: true,
      message: "Super admin registered successfully",
      response: { newUser },
    });
  } catch (error) {
    next(error);
  }
};


export const loginSuperAdmin = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    /* ---------------- VALIDATIONS ---------------- */

    if (!email && !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password not found",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is not present",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is not present",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    /* ---------------- NORMALIZE EMAIL ---------------- */
    email = email.toLowerCase();

    /* ---------------- FIND USER ---------------- */
    const foundUser = await findAdminByEmailandRole(email);

    if (!foundUser) {
      return res.status(400).json({
        success: false,
        message: "Email or password does not match",
      });
    }

    /* ---------------- PASSWORD CHECK ---------------- */
    const match = await bcrypt.compare(password, foundUser.password);

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Email or password does not match",
      });
    }

    /* ---------------- ACCESS TOKEN (SHORT LIVED) ---------------- */
    const accessToken = jwt.sign(
      {
        userId: foundUser._id,
        userType: foundUser.userType,
        isSuperAdmin: foundUser.isSuperAdmin,
      },
      process.env.JWT_ADMIN_ACCESS_SECRET,
      { expiresIn: "5d" }
    );

    /* ---------------- REFRESH TOKEN (LONG LIVED) ---------------- */
    const refreshToken = jwt.sign(
      {
        email: foundUser.email,
        userType: foundUser.userType,
        isSuperAdmin: foundUser.isSuperAdmin,
      },
      process.env.JWT_ADMIN_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    /* ---------------- SET REFRESH TOKEN COOKIE ---------------- */
    res.cookie("superAdminRefreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",   // 🔥 IMPORTANT
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    /* ---------------- SUCCESS RESPONSE ---------------- */
    return res.status(200).json({
      success: true,
      message: "Signin successful",
      response: {
        accessToken, // frontend stores this
        foundUser,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const logoutSuperAdmin = (req, res) => {
  res.clearCookie("superAdminRefreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(200).json({
    success: true,
  });
};


export const signupUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, roleDescription, otherRoleDescription, organizationName } = req.body;

    // 🔴 1. Basic validation
    if (!firstName || !lastName || !email || !password || !phone || !roleDescription) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 🔴 2. Check existing user
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // 🔥 3. CHECK OTP VERIFICATION (IMPORTANT)
    const tempUser = await TempUsers.findOne({ email });

    if (!tempUser || !tempUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    // 🔴 4. Phone split logic
    const mobileNumber = Number(phone.slice(-10));
    const countryCode = "+" + phone.slice(0, phone.length - 10);

    // 🔐 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 6. Create user
    const user = await createAllUsers(
      firstName,
      lastName,
      email,
      hashedPassword,
      mobileNumber,
      countryCode,
      roleDescription,
      otherRoleDescription,
      organizationName
    );

    // 🧹 7. Cleanup temp user (important)
    await TempUsers.deleteOne({ email });

    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      response: user,
    });

  } catch (error) {
    next(error);
  }
};


export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 🔍 Find user
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔐 Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    // 🎟 Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        roleDescription: user.roleDescription,
        otherRoleDescription: user.otherRoleDescription,
        organizationName: user.organizationName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        countryCode: user.countryCode,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified,
      },
      process.env.JWT_USER_KEY,
      { expiresIn: "7d" }
    );

    // Remove password from response
    const { password: _, ...userData } = user.toObject();

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,        // REQUIRED for cross-site cookies
      sameSite: "none",    // REQUIRED for cross-domain
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      response: userData,
    });

  } catch (error) {
    next(error);
  }
};


export const logoutUser = async (req, res, next) => {
  try {

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/"
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful"
    });

  } catch (error) {
    next(error);
  }
};


export const resetPassword = async (req, res) => {

  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  await Users.updateOne(
    { email },
    { password: hashed }
  );

  res.json({
    status: 200,
    success: true,
    message: "Password updated successfully"
  });

};


export const getUserWebinars = async (req, res, next) => {
  try {

    const userEmail = req.body.userEmail;

    const registrations = await findUserWebinarRegistrations(userEmail);

    return res.status(200).json({
      success: true,
      message: "Webinars fetched successfully",
      response: registrations
    });

  } catch (error) {
    next(error);
  }
};


export const getUserRegisteredWebinars = async (req, res) => {
  try {
    const { email } = req.body;

    const registrations = await findUserWebinars(email);
    const webinarSessions = registrations.map(r => ({
      webinarId: r.webinar.toString(),
      webinarDate: r.webinarDate
    }));

    res.json({
      success: true,
      message: "User webinars fetched successfully",
      response: webinarSessions
    });

  } catch (error) {
    next(error);
  }
};


export const updateUserProfile = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      countryCode,
      mobileNumber,
      roleDescription,
      otherRoleDescription,
      organizationName,
    } = req.body;

    // 🔴 validation
    if (!firstName || !lastName || !mobileNumber || !countryCode || !roleDescription || !email) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // 🔥 update user using email
    const updatedUser = await Users.findOneAndUpdate(
      { email },
      {
        firstName,
        lastName,
        mobileNumber,
        countryCode,
        roleDescription,
        otherRoleDescription,
        organizationName,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      response: updatedUser,
    });

  } catch (error) {
    next(error);
  }
};


export const getUserInfo = async (req, res, next) => {
  try {

    const userId = req.user.userId; // coming from JWT

    console.log("User ID from token:", userId);

    const user = await Users.findById({ _id: userId }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      status: 200,
      response: user
    });

  } catch (error) {
    next(error);
  }
};


export const googleSignup = (req, res) => {
const oauth2Client = getOAuthClient(
    GOOGLE_CONFIG.signupRedirectUri
  );
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "select_account consent",
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/calendar.events", // 🔥 add this
    ],
    state: "signup",
  });

  res.redirect(url);
};


export const googleLogin = (req, res) => {
  const oauth2Client = getOAuthClient();

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
    prompt: "select_account",
    state: "login", // 🔥 important
  });

  res.redirect(url);
};


export const googleSignupCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    const oauth2Client = getOAuthClient();

    console.log("🔥 GOOGLE CONFIG DEBUG:");
console.log("CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);
console.log("REDIRECT_URI:", process.env.GOOGLE_REDIRECT_URI);
console.log("CODE:", code);

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();
    const { email, given_name, family_name } = data;

    if (!email) {
      return res.redirect(`${process.env.FRONTEND_URL}/error`);
    }

    const existingUser = await Users.findOne({ email });

    // =========================
    // 🔥 SIGNUP FLOW
    // =========================
    if (state === "signup") {
      if (existingUser) {

        // ❌ If LOCAL user exists → block
        if (existingUser.authType === "local") {
          return res.redirect(
            `${process.env.FRONTEND_URL}/signup?error=use_email_password`
          );
        }

        // ❌ If GOOGLE user exists → block
        if (existingUser.authType === "google") {
          return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=google_account_exists`
          );
        }
      }

      // ✅ Create new Google user
      await Users.create({
        firstName: given_name || "User",
        lastName: family_name || "",
        email,
        authType: "google",
        isEmailVerified: true,
        googleCalendarToken: tokens.refresh_token,
        isCalendarConnected: true,
      });

      return res.redirect(
        `${process.env.FRONTEND_URL}/signup?googleSignupSuccess=true&email=${email}&firstName=${given_name}&lastName=${family_name}`
      );
    }

    // =========================
    // 🔥 LOGIN FLOW
    // =========================
    if (state === "login") {
      if (!existingUser) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/signup?error=no_account`
        );
      }

      const token = jwt.sign(
        { userId: existingUser._id, email: existingUser.email },
        process.env.JWT_USER_KEY,
        { expiresIn: "7d" }
      );

      return res.redirect(
        `${process.env.FRONTEND_URL}/dashboard?token=${token}`
      );
    }

    // fallback
    return res.redirect(`${process.env.FRONTEND_URL}`);

  } catch (error) {
  console.error("❌ Google Auth Error FULL:");

  console.error("Message:", error.message);
  console.error("Stack:", error.stack);

  // 🔥 VERY IMPORTANT for Google APIs
  if (error.response) {
    console.error("Response data:", error.response.data);
  }

  // 🔥 Log OAuth client config (safe check)
  console.error("OAuth Debug:", {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  });

  return res.redirect(`${process.env.FRONTEND_URL}/error`);
}
};