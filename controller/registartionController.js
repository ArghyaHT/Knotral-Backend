import { createRegistrationService, fetchAllRegistrations } from "../services/registrationService.js";

/**
 * Controller to handle creating a new registration
 */
export const createRegistration= async (req, res, next) => {
  try {
    // Take all fields from request body
    const registrationData = req.body;

    // Call the service to save in DB
    const newRegistration = await createRegistrationService(registrationData);

    return res.status(201).json({
      success: true,
      message: "Registration saved successfully",
      data: newRegistration,
    });
  } catch (error) {
        next(error);
    }
};

export const getRegistrations = async (req, res, next) => {
  try {
    const registrations = await fetchAllRegistrations();

    return res.status(200).json({
      success: true,
      message: "Registrations fetched successfully",
      data: registrations
    });
  } catch (error) {
    next(error);
  }
};
