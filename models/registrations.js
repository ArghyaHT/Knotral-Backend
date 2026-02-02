import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    // 👤 Basic Details
    First_Name: { type: String, required: true },
    Last_Name: { type: String, required: true },
    Email: { type: String, required: true },
    Mobile: { type: String, required: true },

    // 🏷️ Lead / Form Meta
    FORM_NAME: { type: String },
    Category: { type: String },
    Lead_Status: { type: String },
    Lead_Source: { type: String },

    // 🏢 Organization Info
    Company: { type: String },
    Designation: { type: String },
    City: { type: String },
    Address_of_Firm: { type: String },
    Landmark: { type: String },
    Region_Zone: { type: String },

    // 🎓 Education / Student Info
    Grade: { type: String },
    Student_s_Name: { type: String },
    Student_s_Age: { type: String },
    Curriculum_Board_Type: { type: String },
    Preferred_Program_Level: { type: String },

    // 📅 Webinar Info
    Webinar_Date_TIme: { type: String },

    // 📊 UTM Tracking
    utm_source: { type: String },
    utm_medium: { type: String },
    utm_campaign: { type: String },

    // 🕒 Meta
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

const Registrations = mongoose.model("Registrations", registrationSchema);
export default Registrations;
