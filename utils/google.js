import { google } from "googleapis";

export const GOOGLE_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,

  // ✅ ONLY ONE CALLBACK (IMPORTANT)
  redirectUri: process.env.GOOGLE_CALLBACK_URL,
};

export const getOAuthClient = () => {
  if (
    !GOOGLE_CONFIG.clientId ||
    !GOOGLE_CONFIG.clientSecret ||
    !GOOGLE_CONFIG.redirectUri
  ) {
    throw new Error("Google OAuth environment variables are missing");
  }

  return new google.auth.OAuth2(
    GOOGLE_CONFIG.clientId,
    GOOGLE_CONFIG.clientSecret,
    GOOGLE_CONFIG.redirectUri // ✅ SINGLE SOURCE OF TRUTH
  );
};