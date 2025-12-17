import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
    {
        webinarId: { type: mongoose.Schema.Types.ObjectId, ref: "Webinar", required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        whatsappNumber: { type: String },
        organization: { type: String }, // School/Organization Name
        city: { type: String },
        receiveUpdates: { type: Boolean, default: false }, // updates about future trainings
        freeTrial: { type: Boolean, default: false }, // interested in free trial
        createdAt: { type: Date, default: Date.now },
    },
    { versionKey: false }
);

const Registrations = mongoose.model("Registrations", registrationSchema);

export default Registrations;