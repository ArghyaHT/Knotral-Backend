// controllers/google.controller.js

import { google } from "googleapis";
import { GOOGLE_CONFIG } from "../utils/google.js";
import { Users } from "../models/user.js";


export const connectGoogle = async (req, res) => {
  const { userId, redirect } = req.query;

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CONFIG.clientId,
    GOOGLE_CONFIG.clientSecret,
    GOOGLE_CONFIG.redirectUri
  );

  // ✅ pass both userId + redirect
  const state = JSON.stringify({
    userId,
    redirect,
  });

 const url = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "select_account consent",
  scope: ["https://www.googleapis.com/auth/calendar.events"],
  state,
});

  res.json({ url });
};

export const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    // ✅ parse state
    const parsedState = JSON.parse(state);
    const { userId, redirect } = parsedState;

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CONFIG.clientId,
      GOOGLE_CONFIG.clientSecret,
      GOOGLE_CONFIG.redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return res.send("No refresh token received. Try again.");
    }

    await Users.findByIdAndUpdate(userId, {
      googleCalendarToken: tokens.refresh_token,
      isCalendarConnected: true,
    });

    // ✅ redirect back to webinar page
    res.redirect(`${redirect}?calendar=connected`);

  } catch (err) {
    console.error(err);
    res.send("Google connection failed");
  }
};