import Registrations from "../models/registrations.js";

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