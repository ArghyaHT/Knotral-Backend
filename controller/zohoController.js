import axios from "axios";
import { getZohoAccessToken } from "../utils/zohoAuth.js";
import Registrations from "../models/registrations.js";
import logger, { logToFile } from "../utils/logger.js";
import SolutionProvider from "../models/solutionProvider.js";
import Leads from "../models/leads.js";
import { Users } from "../models/user.js";
import UserWebinarRegistrations from "../models/userWebinarRegistrations.js";
import { createCalendarEvent } from "../services/calendarService.js";
import Webinars from "../models/webinars.js";
import { generateICS } from "../utils/ics.js";
import { sendCalendarEmail, sendGoogleEmail } from "../utils/emailSender.js";
import moment from "moment";

export const createZohoLead = async (req, res) => {
  try {

    //    /* ✅ STEP 1: Check duplicate registration */
    // const exists = await UserWebinarRegistrations.findOne({
    //   userId: req.user.id,
    //   webinarId: req.body.webinarId,
    //   webinarDate: req.body.Webinar_Date_TIme
    // });

    // if (exists) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "You are already registered for this webinar"
    //   });
    // }

    logger.info("🚀 Creating Zoho Lead", {
      body: {
        ...req.body,
        Email: req.body.Email ? req.body.Email : undefined,
      },
    });
    const accessToken = await getZohoAccessToken();

    const payload = {
      data: [
        {
          First_Name: req.body.First_Name || "",
          Last_Name: req.body.Last_Name || "",
          Mobile: req.body.Mobile,
          Email: req.body.Email,
          FORM_NAME: req.body.FORM_NAME,
          Category: req.body.Category,
          Company: req.body.Company || "",
          City: req.body.City || "",
          Designation: req.body.Designation || "",
          Lead_Status: req.body.Lead_Status,
          Lead_Source: req.body.Lead_Source,
          Grade: req.body.Grade || "",
          Student_s_Name: req.body.Student_Name || "",
          Student_s_Age: req.body.Student_Age || "",
          Curriculum_Board_Type: req.body.School_Board || "",
          Preferred_Program_Level: req.body.Preferred_Program_Level || "",
          Region_Zone: req.body.Region_To_Operate || "",
          Address_of_Firm: req.body.Address || "",
          Landmark: req.body.Landmark || "",
          Webinar_Date_TIme: req.body.Webinar_Date_TIme || "",

          // ✅ UTM fields
          utm_source: req.body.utm_source || "",
          utm_medium: req.body.utm_medium || "",
          utm_campaign: req.body.utm_campaign || "",
        }
      ]
    };

    console.log("ZOHO PAYLOAD", payload)

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

    logger.info("✅ Zoho Lead Created", {
      status: response.status,
      data: response.data,
    });

    /* ✅ Save registration ONLY after Zoho success */
    // if (response.data?.data?.[0]?.code === "SUCCESS") {

    //   await Registrations.create(payload.data);


    //   const user = await Users.findOne({ email: req.body.Email });


    //   // await UserWebinarRegistrations.create({
    //   //   userId: user?._id, // store if user exists
    //   //   email: req.body.Email,
    //   //   webinar: req.body.webinarId,
    //   //   webinarDate: req.body.Webinar_Date_TIme,
    //   //   registeredAt: new Date()
    //   // });


    // }

    if (response.data?.data?.[0]?.code === "SUCCESS") {

      // ✅ Save registration
      await Registrations.create(payload.data);

      // ✅ Find user
      const user = await Users.findOne({ email: req.body.Email });

      const webinar = await Webinars.findById(req.body.webinarId); // implement this function to get webinar details

      // 🔥 GOOGLE CALENDAR INTEGRATION
      if (user?.authType === "google" && user.googleCalendarToken) {
        try {
          await createCalendarEvent({
            refreshToken: user.googleCalendarToken,
            webinar: {
              title: webinar.title,
              organisedBy: req.body.Category,
              startTime: req.body.Webinar_Date_TIme,
            },
          });

          console.log("📅 Calendar event created");

          const googleEmailHtml = `
<div style="background:#f5f7fb; padding:30px 10px; font-family: Arial, sans-serif;">
  <table width="100%">
    <tr>
      <td align="center">
        <table width="520" style="background:#fff; border-radius:10px;">
          
          <tr>
            <td style="background:#4f5d8c; padding:20px; text-align:center; color:#fff;">
              <h2>Knotral Trainings</h2>
            </td>
          </tr>

          <tr>
            <td style="padding:30px;">
              
              <h2>🎉 You're Registered!</h2>

              <p>Your webinar has been successfully added to your Google Calendar.</p>

              <table width="100%">
                <tr>
                  <td><strong>📌 Title:</strong></td>
                  <td>${webinar.title}</td>
                </tr>
                <tr>
                  <td><strong>📂 Organised By:</strong></td>
                  <td>${req.body.Category}</td>
                </tr>
                <tr>
                  <td><strong>📅 Date & Time:</strong></td>
                  <td>
                    ${moment(req.body.Webinar_Date_TIme).format("dddd, MMM D, YYYY")} 
                    at 
                    ${webinar.startTime}
                  </td>
                </tr>
                <tr>
                  <td><strong>⏱ Duration:</strong></td>
                  <td>${webinar.duration}</td>
                </tr>
              </table>

              <p style="margin-top:20px; text-align:center;">
                📅 Check your Google Calendar for the event details.
              </p>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</div>
`;

          await sendGoogleEmail({
            to: user.email,
            subject: `📅 ${webinar.title} - Your Webinar Confirmed`,
            html: googleEmailHtml,
          });
        } catch (err) {
          console.error("❌ Calendar error:", err.message);
        }
      }
      else {
        try {

          const icsContent = generateICS({
            _id: webinar._id,
            title: webinar.title,
            organisedBy: req.body.Category,
            startTime: req.body.Webinar_Date_TIme, // ✅ pass full ISO
            duration: webinar.duration,            // "1 hour"
            userEmail: user.email, // ✅ pass user email for ATTENDEE field
          });

          const emailHtml = `
                <div style="background:#f5f7fb; padding:30px 10px; font-family: Arial, sans-serif;">
    
    <table width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          
          <table width="520" style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
            
            <!-- HEADER -->
            <tr>
              <td style="background:#4f5d8c; padding:20px; text-align:center; color:#fff;">
                <h2 style="margin:0;">Knotral Trainings</h2>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:30px;">
                
                <h2 style="margin-top:0; color:#333;">🎉 You're Registered!</h2>

                <p style="color:#555; font-size:14px;">
                  Your webinar registration has been confirmed. Here are your details:
                </p>

                <!-- DETAILS BOX -->
                <table width="100%" style="margin-top:20px; font-size:14px; color:#444;">
                  <tr>
                    <td style="padding:8px 0;"><strong>📌 Title:</strong></td>
                    <td>${webinar.title}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;"><strong>📂 Organised By:</strong></td>
                    <td>${req.body.Category}</td>
                  </tr>
                 <tr>
                 <td style="padding:8px 0;"><strong>📅 Date & Time:</strong></td>
                 <td>
                ${moment(req.body.Webinar_Date_TIme).format("dddd, MMM D, YYYY")} 
                at 
                ${webinar.startTime}
                </td>
                </tr>
                  <tr>
                    <td style="padding:8px 0;"><strong>⏱ Duration:</strong></td>
                    <td>${webinar.duration}</td>
                  </tr>
                </table>              

                <!-- CALENDAR INFO -->
                <p style="font-size:13px; color:#666; text-align:center;">
                  📎 Download the attached calendar file to add this webinar.
                </p>

              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background:#fafafa; padding:15px; text-align:center; font-size:12px; color:#aaa;">
                Need help? Contact us anytime.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </div>
`;

          await sendCalendarEmail({
            to: user.email,
            subject: `📅 ${webinar.title} - Your Webinar Confirmed`,
            html: emailHtml,        // ✅ include details
            icsContent,
          });

          console.log("📩 ICS email sent to non-Google user");
        } catch (err) {
          console.error("❌ Email calendar error:", err.message);
        }
      }
      //   // await UserWebinarRegistrations.create({
      //   //   userId: user?._id, // store if user exists
      //   //   email: req.body.Email,
      //   //   webinar: req.body.webinarId,
      //   //   webinarDate: req.body.Webinar_Date_TIme,
      //   //   registeredAt: new Date()
      //   // });

      if (user) {
        await UserWebinarRegistrations.create({
          userId: user._id,
          email: user.email,
          webinar: req.body.webinarId,
          webinarDate: req.body.Webinar_Date_TIme,
          registeredAt: new Date()
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Lead stored in Zoho CRM successfully",
      data: response.data
    });

  } catch (error) {
    logger.error("❌ Zoho Lead API Error", {
      message: error.message,
      status: error.response?.status,
      zohoError: error.response?.data,
      request: {
        method: error.config?.method,
        url: error.config?.url,
      },
      stack: error.stack,
      timestamp: new Date(),

    });

    // // ✅ Save to file
    // logToFile(logData);

    // // ✅ Log to Winston/Render console
    // logger.error("❌ Zoho Lead API Error", logData);

    return res.status(500).json({
      success: false,
      error: "Zoho CRM error occurred",
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
          Mobile: req.body.Mobile,
          FORM_NAME: "Knotral Trainings Contact Us",
          Designation: req.body.category,
          City: req.body.city,
          Company: req.body.organization || "",
          Description: req.body.message,
          Lead_Status: "No Contact Initiated",
          Lead_Source: "Knotral Trainings",
        }
      ]
    };

    await Leads.create(payload.data);

    console.log("ZOHO Contact PAYLOAD", payload.data)


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
          First_Name: req.body.First_Name,
          Last_Name: req.body.Last_Name,
          Email: req.body.Email,
          Mobile: req.body.Mobile,
          Designation: req.body.Designation,
          FORM_NAME: "Solution Providers Landing Page",
          Type_of_Solution_You_Offer: [req.body.Type_of_Solution_You_Offer],
          Primary_Target_Audience: [req.body.Primary_Target_Audience],
          Lead_Status: "No Contact Initiated",
          Lead_Source: "Knotral Trainings",
          Products: "Solution Provider",

        }
      ]
    };

    console.log("ZOHO SOLUTION PROVIDER PAYLOAD", payload.data)

    await SolutionProvider.create(payload.data);


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
