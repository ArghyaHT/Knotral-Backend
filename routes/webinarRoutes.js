import express from "express";
import { addPastSession, addTrainerToWebinar, createBulkWebinars, createWebinar, deleteWebinar, filterWebinars, getAllCertifiedWebinarsByPagination, getAllWebinars, getAllWebinarsByPagination, getLiveWebinarsByPagination, getPastWebinarsByPagination, getWebinarsById, getWebinarsBySlug, incrementWebinarViews, removeTrainer, searchWebinarsByCategory, updateWebinar, updateWebinarSchema, updateWebinarSpeaker, updateWebinarStatus, updateWebinarUtm, uploadWebinarLogo, uploadWebinarOg } from "../controller/webinarController.js";
import { upload } from "../middlewares/Upload.js";

const router = express.Router()

router.route("/create-webinar").post(createWebinar)

router.route("/update-webinar").put(updateWebinar)

router.post("/bulk-webinar-upload", createBulkWebinars);

router.route("/upload-webinar-logo").post(upload.single("logo"), uploadWebinarLogo);

router.route("/upload-webinar-og").post(upload.single("ogImage"), uploadWebinarOg);

router.route("/update-trainer").post(upload.single("image"), updateWebinarSpeaker);

router.route("/remove-trainer").post(removeTrainer);


router.post("/add-trainer", upload.single("trainerImage"), addTrainerToWebinar);

router.route("/get-webinars").get(getAllWebinars)

router.route("/get-limited-webinars").get(getLiveWebinarsByPagination)

router.route("/get-past-webinars").get(getPastWebinarsByPagination)

router.route("/get-certified-webinars").get(getAllCertifiedWebinarsByPagination)

router.put("/increment-views", incrementWebinarViews);


router.route("/get-webinar-by-id").post(getWebinarsById)

router.get("/get-webinar-by-slug", getWebinarsBySlug);


router.route("/get-webinars-by-category").get(searchWebinarsByCategory)

router.route("/get-webinars-by-type").get(filterWebinars)

router.route("/update-webinar-utm").put(updateWebinarUtm)

router.route("/update-webinar-schema").put(updateWebinarSchema)

router.route("/upload-past-sessions").put(addPastSession)

router.route("/update-webinar-status").post(updateWebinarStatus)

router.route("/delete-webinar").post(deleteWebinar)

router.route("/get-all-webinars").get(getAllWebinarsByPagination)




export default router