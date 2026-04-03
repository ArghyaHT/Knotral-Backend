import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    mobileNumber: {
      type: Number,
      required: true,
    },

    countryCode: {
      type: String,
      required: true,
    },

    userType: {
      type: String,
      enum: ["student", "teacher", "school", "solutionProvider", "SuperAdmin"],
    },

    isSuperAdmin: {
      type: Boolean,
      default: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

  },
  {
    timestamps: true,
  }
);

export const Users = mongoose.model("Users", userSchema);