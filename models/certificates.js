import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    // Webinar Reference
    webinarId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Webinar",
      required: true,
    },

    webinarOrganiser: {
      type: String,
      required: true,
      trim: true,
    },

    // Cloudinary File Details
    certificateFile: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
      },
      format: {
        type: String, // pdf, jpg, png
      },
      resource_type: {
        type: String, // raw (for pdf), image (for jpg/png)
      },
    },

     // SAMPLE WATERMARKED VERSION (Public Use)
    sampleCertificateFile: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      secure_url: String,
      format: String,
      resource_type: String,
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


export const Certificates = mongoose.model("Certificates", certificateSchema);