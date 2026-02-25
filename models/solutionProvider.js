import mongoose from "mongoose";

const solutionProviderSchema = new mongoose.Schema(
  {
    // 👤 Basic Details
    First_Name: { type: String, required: true },
    Last_Name: { type: String, required: true },
    Email: { type: String, required: true },
    Mobile: { type: String, required: true },
    Designation: { type: String },

    // 🏷️ Lead / Form Meta
    FORM_NAME: { 
      type: String, 
      default: "Solution Providers Landing Page" 
    },
    Lead_Status: { 
      type: String, 
      default: "No Contact Initiated" 
    },
    Lead_Source: { 
      type: String, 
      default: "Knotral" 
    },

    // 🧩 Solution Info
    Type_of_Solution_You_Offer: [{ type: String }],
    Primary_Target_Audience: [{ type: String }],   
    Products: { 
      type: String, 
      default: "Solution Provider"
    },   


    // 🕒 Meta
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

const SolutionProvider = mongoose.model(
  "SolutionProvider",
  solutionProviderSchema
);

export default SolutionProvider;