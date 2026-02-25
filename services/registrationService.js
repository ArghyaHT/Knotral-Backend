import Registrations from "../models/registrations.js";
import { fetchFutureWebinars } from "./webinarServices.js";

/**
 * Create a new registration
 * @param {Object} data - Registration data
 * @returns {Promise<Registrations>}
 */
export const createRegistrationService = async (data) => {
  const {
    webinarId,
    firstName,
    lastName,
    email,
    whatsappNumber,
    organization,
    city,
    receiveUpdates,
    freeTrial,
  } = data;


  const registration = new Registrations({
    webinarId,
    firstName,
    lastName,
    email,
    whatsappNumber: whatsappNumber || "",
    organization: organization || "",
    city: city || "",
    receiveUpdates: receiveUpdates || false,
    freeTrial: freeTrial || false,
  });

  return await registration.save();
};

/**
 * Get all registrations for a webinar
 * @param {String} webinarId
 */
export const getRegistrationsByWebinar = async (webinarId) => {
  return await Registrations.find({ webinarId });
};


export const fetchAllRegistrations = async () => {
  const futureWebinars = await fetchFutureWebinars();

  if (!futureWebinars.length) return [];

  const organiserWords = futureWebinars
    .map(w => w.organisedBy)
    .filter(Boolean)
    .flatMap(name =>
      name
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2)
    );

  if (!organiserWords.length) return [];

  const organiserRegex = new RegExp(organiserWords.join("|"), "i");

  return await Registrations.find({
    FORM_NAME: { $regex: organiserRegex }
  })
    .sort({ createdAt: -1 }) // ✅ SORT HERE
    .lean();
};