import express from "express";
import { addTrainerToWebinar, createBulkWebinars, createWebinar, filterWebinars, getAllCertifiedWebinarsByPagination, getAllWebinars, getAllWebinarsByPagination, getWebinarsById, getWebinarsBySlug, incrementWebinarViews, searchWebinarsByCategory, uploadWebinarLogo, uploadWebinarSpeakerImage } from "../controller/webinarController.js";
import { upload } from "../middlewares/Upload.js";

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





export default router