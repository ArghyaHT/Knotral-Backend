import express from "express";
import { createWebinar, filterWebinars, getAllWebinars, getAllWebinarsByPagination, getWebinarsById, getWebinarsBySlug, searchWebinarsByCategory, uploadWebinarLogo } from "../controller/webinarController.js";
import { upload } from "../middlewares/Upload.js";

const router = express.Router()

router.route("/create-webinar").post(createWebinar)

router.route("/upload-webinar-logo").post(upload.single("logo"), uploadWebinarLogo);

router.route("/get-webinars").get(getAllWebinars)

router.route("/get-limited-webinars").get(getAllWebinarsByPagination)


router.route("/get-webinar-by-id").post(getWebinarsById)

router.get("/get-webinar-by-slug", getWebinarsBySlug);


router.route("/get-webinars-by-category").get(searchWebinarsByCategory)

router.route("/get-webinars-by-type").get(filterWebinars)





export default router