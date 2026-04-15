import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
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
      minlength: 8,
    },

    mobileNumber: {
      type: Number,
    },

    countryCode: {
      type: String,
    },

    userType: {
      type: String,
      enum: ["student", "teacher", "school", "solutionProvider", "SuperAdmin"],
      // default: "",
    },

    authType: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    isSuperAdmin: {
      type: Boolean,
      default: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    roleDescription: {
      type: String,
      enum: [
        "Teacher",
        "School Leader",
        "Education Solution Partner",
        "Education Consultants",
        "Other"
      ],
    },


    otherRoleDescription: {
      type: String,
      trim: true,
    },

    organizationName: {
      type: String,
      trim: true,
    },

    googleCalendarToken: String, // Refresh Token
    isCalendarConnected: { type: Boolean, default: false }

  },
  {
    timestamps: true,
  }
);

export const Users = mongoose.model("Users", userSchema);