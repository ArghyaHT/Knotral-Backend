import { createRegistrationService } from "../services/registrationService.js";

/**
 * Controller to handle creating a new registration
 */
export const createRegistration= async (req, res) => {
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
    console.error("Registration error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create registration",
    });
  }
};
