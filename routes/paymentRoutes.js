import express from "express";
import { createPayment, verifyPayment } from "../controller/paymentsController.js";

const router = express.Router();

// Razorpay Routes
router.post("/create-payment", createPayment);
router.post("/verify-payment", verifyPayment);


export default router;