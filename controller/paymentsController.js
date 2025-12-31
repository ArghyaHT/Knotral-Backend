import Razorpay from "razorpay";
import { createPaymentRecord, updatePaymentStatus } from "../services/paymentService.js";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- Controller: Create Razorpay Order ---
export const createPayment = async (req, res) => {
  try {
    const { amount, currency, webinarId, webinarTitle, category, userData } = req.body;

    if (!amount || !currency || !webinarId || !webinarTitle || !category) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt: `receipt_${Date.now()}`
    });

    // Save initial record
    await createPaymentRecord({
      webinarId,
      webinarTitle,
      category,
      ...userData,
      orderId: order.id,
      amount,
      currency,
      status: "pending"
    });

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error) {
    console.error("Error creating payment order:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



// --- API Endpoint 2: To Verify the Payment Signature ---
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await updatePaymentStatus(razorpay_order_id, { status: "FAILED" });
      return res.status(400).json({ success: false, message: "Invalid signature." });
    }

    // Update success status
    await updatePaymentStatus(razorpay_order_id, {
      status: "success",
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};