import express from "express"
import cors from "cors"
import { rateLimit } from "express-rate-limit";
import http from "http"
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import webinarRoutes from "./routes/webinarRoutes.js"
import registrationRoutes from "./routes/registrationRoutes.js"


import { GlobalErrorHandler } from "./middlewares/GlobalErrorHandler.js";
import { v2 as cloudinary } from "cloudinary";


dotenv.config()
const app = express()
const server = http.createServer(app);
app.set("trust proxy", 1);



const rateLimiter = rateLimit({
  windowMs: 20 * 1000, // 15 minutes
  limit: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
  message: 'Too many request from this IP.Please try again later',
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // store: ... , // Use an external store for more precise rate limiting
})


// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Perform necessary actions to handle the error gracefully
  // For example, log the error, perform cleanup, and gracefully exit the process if needed
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Perform necessary actions to handle the rejection gracefully
  // For example, log the rejection, perform cleanup, and handle the promise rejection if needed
});

connectDB()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const allowedOrigins = [
  "http://localhost:3000",
  /\.netlify\.app$/ 
];

// //Use Multiple Cors
app.use(cors({
  origin: function (origin, callback) {
    // Check if the origin is in the allowed origins list or if it's undefined (like in case of same-origin requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error("Not allowed by CORS")); // Deny the request
    }
  },
  // credentials: true
}));

app.use(rateLimiter)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }));

app.use("/api/webinars", webinarRoutes)
app.use("/api/registration", registrationRoutes)


app.use(GlobalErrorHandler)

const PORT = process.env.PORT || 3001;

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
