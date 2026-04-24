import moment from "moment";

// ✅ convert "1 hour" / "45 min" → minutes
const parseDurationToMinutes = (durationStr) => {
  if (!durationStr) return 60;

  const lower = durationStr.toLowerCase();

  if (lower.includes("hour")) {
    const hours = parseInt(lower) || 1;
    return hours * 60;
  }

  if (lower.includes("min")) {
    return parseInt(lower) || 60;
  }

  return 60;
};

export const generateICS = ({ _id, title, organisedBy, startTime, duration }) => {
  // ✅ parse ISO startTime directly (BEST PRACTICE)
  const start = moment(startTime);

  const durationMinutes = parseDurationToMinutes(duration);
  const end = moment(start).add(durationMinutes, "minutes");

  // ✅ format for ICS (UTC required)
  const format = (d) => d.utc().format("YYYYMMDDTHHmmss") + "Z";

 const ics = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//Knotral//Webinar//EN",
  "CALSCALE:GREGORIAN",
  "METHOD:PUBLISH",
  "BEGIN:VEVENT",
  `UID:${_id}@knotral.com`,
  `DTSTAMP:${format(moment())}`,
  `DTSTART:${format(start)}`,
  `DTEND:${format(end)}`,
  `SUMMARY:${title}`,
  `DESCRIPTION:Hosted by ${organisedBy}`,
  "LOCATION:Online",
  "STATUS:CONFIRMED",
  "END:VEVENT",
  "END:VCALENDAR"
].join("\r\n")

  return ics;
};