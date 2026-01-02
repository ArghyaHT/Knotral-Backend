import axios from "axios";
import { getZohoAccessToken } from "../utils/zohoAuth.js";

export const createZohoLead = async (req, res) => {
  try {
    const accessToken = await getZohoAccessToken();

    const payload = {
      data: [
        {
          First_Name: req.body.First_Name,
          Last_Name: req.body.Last_Name,
          Mobile: req.body.Mobile,
          Email: req.body.Email,
          FORM_NAME: req.body.FORM_NAME,
          Category: req.body.Category,
          Company: req.body.Company,
          City: req.body.City,
          Designation: req.body.Designation,
          Lead_Status: req.body.Lead_Status,
          Lead_Source: req.body.Lead_Source,
          Grade: req.body.Grade,
          Address_of_Firm: req.body.Address,
          Landmark: req.body.Landmark
        }
      ]
    };

    const response = await axios.post(
      `${process.env.ZOHO_API_DOMAIN}/crm/v2/Leads`,
      payload,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: "Lead stored in Zoho CRM successfully",
      data: response.data
    });

  } catch (error) {
    console.error("❌ Zoho Lead API Error:", error.response?.data || error);
    return res.status(500).json({
      success: false,
      error: error.response?.data || "Zoho CRM error occurred"
    });
  }
};


export const createZohoContact = async (req, res) => {
  try {
    const accessToken = await getZohoAccessToken();

    const payload = {
      data: [
        {
          First_Name: req.body.firstName,
          Last_Name: req.body.lastName,
          Email: req.body.email,
          Mobile: req.body.phone,
          FORM_NAME: "Contact Us",
          Category: req.body.category,
          Company: req.body.organization || "",
          Subject: req.body.subject,
          Description: req.body.message,
          Lead_Source: "Website Contact Form"
        }
      ]
    };

    const response = await axios.post(
      `${process.env.ZOHO_API_DOMAIN}/crm/v2/Leads`,
      payload,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: "Contact request submitted successfully",
      data: response.data
    });

  } catch (error) {
    console.error("❌ Zoho Contact API Error:", error.response?.data || error);
    return res.status(500).json({
      success: false,
      error: error.response?.data || "Zoho CRM error occurred"
    });
  }
};



export const createZohoSlutionProvidersForm = async (req, res) => {
  try {
    const accessToken = await getZohoAccessToken();

    const payload = {
      data: [
        {
          Name: req.body.Name,
          // Last_Name: req.body.lastName,
          Email: req.body.Email,
          Mobile: req.body.Mobile,
          Designation: req.body.Designation,
          FORM_NAME: "Solution Providers Landing Page",
          Solution_Type: req.body.Solution_Type,
          Target_Audience: req.body.Target_Audience,
        }
      ]

        //  Name: "",
        // Email: "",
        // Mobile: "",
        // Designation: "",
        // FORM_NAME: "Solution Providers Landing Page",
        // Solution_Type: "",
        // Target_Audience: ""
    };

    const response = await axios.post(
      `${process.env.ZOHO_API_DOMAIN}/crm/v2/Leads`,
      payload,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: "Contact request submitted successfully",
      data: response.data
    });

  } catch (error) {
    console.error("❌ Zoho Contact API Error:", error.response?.data || error);
    return res.status(500).json({
      success: false,
      error: error.response?.data || "Zoho CRM error occurred"
    });
  }
};
