import axios from "axios";
import qs from "qs"; // npm install qs

export const getZohoAccessToken = async () => {
  try {
    const url = "https://accounts.zoho.in/oauth/v2/token";

    const { data } = await axios.post(
      url,
      qs.stringify({
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: "refresh_token",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    // console.log("Zoho Token Response:", data); // log full response

    if (!data.access_token) {
      throw new Error("No access token returned from Zoho");
    }

    return data.access_token;
  } catch (error) {
    console.error("❌ Error refreshing Zoho token:", error.response?.data || error);
    throw error;
  }
};
