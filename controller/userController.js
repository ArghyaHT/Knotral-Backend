import { validateEmail } from "../middlewares/validator.js";
import { TempUsers } from "../models/tempUsers.js";
import { createAllUsers, createUser, findAdminByEmailandRole, findUserByEmail } from "../services/userService.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

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
    const { name, email, password, phone, userType } = req.body;

    // 🔴 1. Basic validation
    if (!name || !email || !password || !phone || !userType) {
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
      name,
      email,
      hashedPassword,
      mobileNumber,
      countryCode,
      userType
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

    // 🔐 Match password
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
        email: user.email,
        userType: user.userType,
      },
      process.env.JWT_USER_KEY,
      { expiresIn: "7d" }
    );

    const { password: _, ...userData } = user.toObject();

    // ✅ Response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      response: userData,
    });

  } catch (error) {
    next(error);
  }
};