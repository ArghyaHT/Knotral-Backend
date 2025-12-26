import axios from "axios";
import { getZohoAccessToken } from "../utils/zohoAuth.js";

export const createZohoLead = async (req, res) => {
  try {
    const accessToken = await getZohoAccessToken();
    console.log(accessToken)

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
          Lead_Source: req.body.Lead_Source
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
