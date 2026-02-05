import express from "express";
import { addTrainerToWebinar, createWebinar, getAllWebinars, getAllWebinarsByPagination, getWebinarsBySlug, uploadWebinarLogo, uploadWebinarOg } from "../controller/webinarController.js";
import { upload } from "../middlewares/Upload.js";

const router = express.Router();


router.route("/create-webinar").post(createWebinar)

router.route("/upload-webinar-logo").post(upload.single("logo"), uploadWebinarLogo);

router.route("/upload-webinar-og").post(upload.single("ogImage"), uploadWebinarOg);

router.post("/add-trainer", upload.single("trainerImage"), addTrainerToWebinar);

router.route("/get-webinars").get(getAllWebinars)

router.get("/get-webinar-by-slug", getWebinarsBySlug);

router.route("/get-all-webinars").get(getAllWebinarsByPagination)



export default router;