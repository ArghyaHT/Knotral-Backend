import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // Webinar Details
    webinarId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Webinar",
      required: true,
    },
    webinarTitle: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true, // since you added it, making it required makes sense
      trim: true,
    },

    // User Registration Data
    First_Name: {
      type: String,
      required: true,
      trim: true,
    },
    Last_Name: {
      type: String,
      required: true,
      trim: true,
    },
    Email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    Mobile: {
      type: String,
      trim: true,
      match: [/^\+?[0-9]{7,15}$/, "Invalid mobile number format"],
    },

    // Payment Details
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentId: {
      type: String,
    },
    signature: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Amount must be greater than 0"],
    },
    currency: {
      type: String, // no enum, no default
      required: true,
      trim: true,
    },

    // Status Tracking
    status: {
      type: String, // no enum, no default
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

export const Payment = mongoose.model("Payment", paymentSchema);
