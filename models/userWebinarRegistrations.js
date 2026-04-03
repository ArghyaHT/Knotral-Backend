import mongoose from "mongoose";

const userWebinarRegistrationSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
    index: true
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },

  webinarId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Webinars",
    // required: true,
    index: true
  },

  webinarDate: {
    type: Date,
    required: true,
    index: true
  },

  registeredAt: {
    type: Date,
    default: Date.now
  }
},
{
  timestamps: true
}
);

// prevent duplicate registration for same session
userWebinarRegistrationSchema.index(
  { email: 1, webinarId: 1, webinarDate: 1 },
  { unique: true }
);

// fast webinar attendee lookup
userWebinarRegistrationSchema.index({ webinarId: 1, webinarDate: 1 });

// fast user history
userWebinarRegistrationSchema.index({ userId: 1, webinarDate: -1 });

export const UserWebinarRegistrations = mongoose.model(
  "UserWebinarRegistrations",
  userWebinarRegistrationSchema
);