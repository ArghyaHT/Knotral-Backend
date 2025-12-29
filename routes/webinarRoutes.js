import express from "express";
import { addTrainerToWebinar, createBulkWebinars, createWebinar, filterWebinars, getAllCertifiedWebinarsByPagination, getAllWebinars, getAllWebinarsByPagination, getWebinarsById, getWebinarsBySlug, incrementWebinarViews, searchWebinarsByCategory, uploadWebinarLogo, uploadWebinarSpeakerImage } from "../controller/webinarController.js";
import { upload } from "../middlewares/Upload.js";
import Webinars from "../models/webinars.js";

const router = express.Router()

router.route("/create-webinar").post(createWebinar)

router.post("/bulk-webinar-upload", createBulkWebinars);

router.route("/upload-webinar-logo").post(upload.single("logo"), uploadWebinarLogo);

router.route("/upload-webinar-logo").post(upload.single("logo"), uploadWebinarLogo);

router.route("/upload-webinar-trainer-image").post(upload.single("image"), uploadWebinarSpeakerImage);

router.post("/add-trainer", upload.single("trainerImage"), addTrainerToWebinar);

router.route("/get-webinars").get(getAllWebinars)

router.route("/get-limited-webinars").get(getAllWebinarsByPagination)

router.route("/get-certified-webinars").get(getAllCertifiedWebinarsByPagination)

router.put("/increment-views", incrementWebinarViews);


router.route("/get-webinar-by-id").post(getWebinarsById)

router.get("/get-webinar-by-slug", getWebinarsBySlug);


router.route("/get-webinars-by-category").get(searchWebinarsByCategory)

router.route("/get-webinars-by-type").get(filterWebinars)


// router.put("/update-subheading", async (req, res) => {
//   try {
//     const { webinarId, registerFormSubheading } = req.body;

//     // Validate inputs
//     if (!webinarId) {
//       return res.status(400).json({
//         success: false,
//         message: "webinarId is required",
//       });
//     }

//     if (!registerFormSubheading) {
//       return res.status(400).json({
//         success: false,
//         message: "registerFormSubheading is required",
//       });
//     }

//     // Update entry
//     const updatedWebinar = await Webinars.findByIdAndUpdate(
//       webinarId,
//       { registerFormSubheading },
//       { new: true }
//     );

//     if (!updatedWebinar) {
//       return res.status(404).json({
//         success: false,
//         message: "Webinar not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Subheading updated successfully",
//       data: updatedWebinar,
//     });

//   } catch (error) {
//     console.error("Error updating webinar:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// });





export default router