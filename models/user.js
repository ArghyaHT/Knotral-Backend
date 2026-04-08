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
        "Education Consultant",
        "Other"
      ],
      required: true,
    },


    otherRoleDescription: {
      type: String,
      trim: true,
    },

     organizationName: {
      type: String,
      trim: true,
    }

  },
  {
    timestamps: true,
  }
);

export const Users = mongoose.model("Users", userSchema);