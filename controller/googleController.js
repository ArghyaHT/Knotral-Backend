// controllers/google.controller.js
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { Users } from "../models/user.js";
import { GOOGLE_CONFIG, getOAuthClient } from "../utils/google.js";

export const googleSignup = (req, res) => {
  const oauth2Client = getOAuthClient();

  let redirect = req.query.redirect;

  // ✅ CLEAN REDIRECT HERE
  if (redirect) {
    try {
      redirect = decodeURIComponent(redirect);

      // ❗ If redirect contains another redirect → extract inner one
      if (redirect.includes("redirect=")) {
        const inner = new URLSearchParams(redirect.split("?")[1]).get("redirect");
        redirect = inner || "/";
      }

      // ❗ If full URL → convert to path
      if (redirect.startsWith("http")) {
        const urlObj = new URL(redirect);
        redirect = urlObj.pathname + urlObj.search;
      }

    } catch {
      redirect = "/";
    }
  }

  // ✅ fallback
  if (!redirect) {
    redirect = "/";
  }

  console.log("✅ CLEAN REDIRECT:", redirect);

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent select_account",
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/calendar.events",
    ],
    state: JSON.stringify({
      type: "signup",
      redirect,   // 👈 IMPORTANT
    }),
  });

  res.redirect(url);
};


export const googleLogin = (req, res) => {
  const oauth2Client = getOAuthClient();

  const redirect = req.query.redirect || process.env.FRONTEND_URL;

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "select_account",
    scope: ["profile", "email"],
    state: JSON.stringify({
      type: "login",
      redirect,
    }),
  });

  res.redirect(url);
};


export const connectGoogle = (req, res) => {
  const { userId } = req.query;

  const oauth2Client = getOAuthClient();

  const redirect =
    req.query.redirect || process.env.FRONTEND_URL;

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent select_account",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    state: JSON.stringify({
      type: "calendar",
      userId,
      redirect,
    }),
  });

  res.redirect(url);
};


export const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL}/error`);
    }

    let parsed;
    try {
      parsed = JSON.parse(state);
    } catch {
      return res.redirect(`${process.env.FRONTEND_URL}/error`);
    }

    let { type, redirect } = parsed;

    // ✅ CLEAN AGAIN (defensive)
if (redirect?.includes("redirect=")) {
  const inner = new URLSearchParams(redirect.split("?")[1]).get("redirect");
  redirect = inner || "/";
}

    console.log("🔔 Google Callback - redirect:", redirect);

    const signupPage = `${process.env.FRONTEND_URL}/sign-up`;

    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // =========================
    // 📅 CALENDAR FLOW
    // =========================
    if (type === "calendar") {
      const { userId, redirect } = parsed;

      if (!userId) {
        return res.redirect(`${process.env.FRONTEND_URL}/error`);
      }

      await Users.findByIdAndUpdate(userId, {
        googleCalendarToken: tokens.refresh_token,
        isCalendarConnected: true,
      });

      return res.redirect(`${redirect}?calendar=connected`);
    }

    // =========================
    // 🔐 USER INFO
    // =========================
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
// 🆕 SIGNUP FLOW (FIXED)
// =========================
if (type === "signup") {

if (existingUser) {

  let errorType = "exists";

  if (existingUser.authType === "local") {
    errorType = "local_exists"; // user signed up manually
  } else if (existingUser.authType === "google") {
    errorType = "google_exists"; // already signed up with google
  }

  const errorRedirect = redirect
    ? `${signupPage}?error=${errorType}&redirect=${encodeURIComponent(redirect)}`
    : `${signupPage}?error=${errorType}`;

  return res.redirect(errorRedirect);
}

  await Users.create({
    email,
    firstName: given_name || "",
    lastName: family_name || "",
    authType: "google",
    isEmailVerified: true,
    googleCalendarToken: tokens.refresh_token,
    isCalendarConnected: true,
  });


  // ✅ IMPORTANT: send ONLY flag, not nested path
  const finalUrl = redirect
    ? `${signupPage}?signup=success&email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirect)}`
    : `${signupPage}?signup=success&email=${encodeURIComponent(email)}`;

  return res.redirect(finalUrl);
}

    // =========================
    // 🔑 LOGIN FLOW
    // =========================
  if (type === "login") {
  const safeRedirect = redirect || process.env.FRONTEND_URL;

  if (!existingUser) {
        return res.redirect(`${safeRedirect}/sign-up?error=no_account`);
  }

  const token = jwt.sign(
        {
        userId: existingUser._id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        roleDescription: existingUser.roleDescription,
        otherRoleDescription: existingUser.otherRoleDescription,
        organizationName: existingUser.organizationName,
        email: existingUser.email,
        mobileNumber: existingUser.mobileNumber,
        countryCode: existingUser.countryCode,
        userType: existingUser.userType,
        isEmailVerified: existingUser.isEmailVerified,
      },
    process.env.JWT_USER_KEY,
    { expiresIn: "7d" }
  );
      return res.redirect(`${safeRedirect}?token=${token}`);

}

    return res.redirect(process.env.FRONTEND_URL);

  } catch (error) {
    console.error("❌ Google Callback Error:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/error`);
  }
};