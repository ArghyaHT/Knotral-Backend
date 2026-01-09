import express from "express";
import { addTrainerToWebinar, createBulkWebinars, createWebinar, filterWebinars, getAllCertifiedWebinarsByPagination, getAllWebinars, getAllWebinarsByPagination, getWebinarsById, getWebinarsBySlug, incrementWebinarViews, searchWebinarsByCategory, updateWebinar, updateWebinarSchema, updateWebinarUtm, uploadWebinarLogo, uploadWebinarOg, uploadWebinarSpeakerImage } from "../controller/webinarController.js";
import { upload } from "../middlewares/Upload.js";
import Webinars from "../models/webinars.js";

const router = express.Router()

router.route("/create-webinar").post(createWebinar)

router.route("/update-webinar").put(updateWebinar)

router.post("/bulk-webinar-upload", createBulkWebinars);

router.route("/upload-webinar-logo").post(upload.single("logo"), uploadWebinarLogo);

router.route("/upload-webinar-og").post(upload.single("ogImage"), uploadWebinarOg);


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

router.route("/update-webinar-utm").put(updateWebinarUtm)

router.route("/update-webinar-schema").put(updateWebinarSchema)

// router.put("/update-meta", async (req, res) => {
//   try {
//     const { webinarId, metaTitle, metaDescription } = req.body;

//     // Validate inputs
//     if (!webinarId) {
//       return res.status(400).json({
//         success: false,
//         message: "webinarId is required",
//       });
//     }

//     if (!metaTitle && !metaDescription) {
//       return res.status(400).json({
//         success: false,
//         message: "metaTitle or metaDescription is required",
//       });
//     }

//     // Update entry
//     const updatedWebinar = await Webinars.findByIdAndUpdate(
//       webinarId,
//       { metaTitle, metaDescription },
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
//       message: "Meta details updated successfully",
//       data: updatedWebinar,
//     });

//   } catch (error) {
//     console.error("Error updating webinar meta:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// });





export default router