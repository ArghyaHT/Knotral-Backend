import mongoose from "mongoose";

const zohoLeadSchema = new mongoose.Schema(
  {
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
      lowercase: true,
      trim: true,
    },
    Mobile: {
      type: String,
      required: true,
      trim: true,
    },
    FORM_NAME: {
      type: String,
      default: "Knotral Trainings Contact Us",
    },
    Designation: {
      type: String,
      trim: true,
    },
    City: {
      type: String,
      trim: true,
    },
    Company: {
      type: String,
      default: "",
      trim: true,
    },
    Description: {
      type: String,
      trim: true,
    },
    Lead_Status: {
      type: String,
      default: "No Contact Initiated",
    },
    Lead_Source: {
      type: String,
      default: "Knotral Trainings",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Leads", zohoLeadSchema);