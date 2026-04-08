import UserWebinarRegistrations from "../models/userWebinarRegistrations.js";

export const findUserWebinarRegistrations = async (userEmail) => {
     const registrations = await UserWebinarRegistrations
          .find({ email: userEmail })
          .populate("webinar")
          .sort({ webinarDate: -1 });

     return registrations;

};


export const findUserWebinars = async (email) => {

     const now = new Date();

     const registrations = await UserWebinarRegistrations.find({
          email: email,
          webinarDate: { $gte: now }   // ✅ only future webinars
     }).select("webinar webinarDate");

     return registrations;

};