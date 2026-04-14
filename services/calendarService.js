// services/calendar.service.js

import { google } from "googleapis";
import { GOOGLE_CONFIG } from "../utils/google";

export const createCalendarEvent = async ({
  refreshToken,
  webinar,
}) => {
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CONFIG.clientId,
    GOOGLE_CONFIG.clientSecret,
    GOOGLE_CONFIG.redirectUri
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const calendar = google.calendar({
    version: "v3",
    auth: oauth2Client,
  });

  const start = new Date(webinar.startTime);
  const end = new Date(start.getTime() + 60 * 60000); // 1 hour

  await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: webinar.title,
      description: `Organized by ${webinar.organisedBy}`,

      start: {
        dateTime: start.toISOString(),
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: "Asia/Kolkata",
      },

      reminders: {
        useDefault: true,
      },
    },
  });
};