import UserWebinarRegistrations from "../models/userWebinarRegistrations.js";

 export const findUserWebinarRegistrations= async (userEmail) => {
 const registrations = await UserWebinarRegistrations
      .find({ email: userEmail })
      .populate("webinar") 
      .sort({ webinarDate: -1 });

      return registrations;

 };