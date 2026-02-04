import winston from "winston";
import fs from "fs";
import path from "path";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

export default logger;


// Log file path
const logFile = path.join(process.cwd(), "zoho-error.log");

/**
 * Append a log entry to the zoho-error.log file
 * @param {Object} data - The object you want to log
 */
export const logToFile = (data) => {
  try {
    fs.appendFileSync(logFile, JSON.stringify(data, null, 2) + "\n", "utf8");
  } catch (err) {
    console.error("Failed to write log to file:", err);
  }
};