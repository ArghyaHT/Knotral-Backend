export const GOOGLE_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_CALLBACK_URL,
};

// ✅ Create OAuth Client
export const getOAuthClient = () => {
  if (
    !GOOGLE_CONFIG.process.env.GOOGLE_CLIENT_ID ||
    !GOOGLE_CONFIG.process.env.GOOGLE_CLIENT_SECRET ||
    !GOOGLE_CONFIG.process.env.GOOGLE_SIGNUP_CALLBACK_URL
  ) {
    throw new Error("Google OAuth environment variables are missing");
  }

  return new google.auth.OAuth2(
    GOOGLE_CONFIG.process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CONFIG.process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CONFIG.process.env.GOOGLE_SIGNUP_CALLBACK_URL
  );
};