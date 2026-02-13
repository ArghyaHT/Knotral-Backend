import express from "express";
import {
  addTrainerToWebinar,
  createWebinar,
  getAllWebinars,
  getAllWebinarsByPagination,
  getWebinarsBySlug,
  uploadWebinarLogo,
  uploadWebinarOg,
} from "../controller/webinarController.js";
import { upload, uploadCertificate } from "../middlewares/Upload.js";
import { getRegistrations } from "../controller/registartionController.js";
import { verifySuperAdminAccessToken } from "../middlewares/VerifyRefreshTokenAdmin.js";
import { getWebinarCertificates, uploadWebinarCertificate } from "../controller/certificatesController.js";

const router = express.Router();

/* 🔐 SUPER ADMIN ONLY */
router.post(
  "/create-webinar",
  verifySuperAdminAccessToken,
  createWebinar
);

router.post(
  "/upload-webinar-logo",
  verifySuperAdminAccessToken,
  upload.single("logo"),
  uploadWebinarLogo
);

router.post(
  "/upload-webinar-og",
  verifySuperAdminAccessToken,
  upload.single("ogImage"),
  uploadWebinarOg
);

router.post(
  "/add-trainer",
  verifySuperAdminAccessToken,
  upload.single("trainerImage"),
  addTrainerToWebinar
);

router.post(
  "/get-registrations",
  verifySuperAdminAccessToken,
  getRegistrations
);

/* PUBLIC ROUTES */
router.get("/get-webinars", getAllWebinars);
router.get("/get-webinar-by-slug", getWebinarsBySlug);
router.get("/get-all-webinars", getAllWebinarsByPagination);

/* CERTIFICATE ROUTES */
router.post(
  "/upload-webinar-certificate",
  uploadCertificate.single("certificate"),
  uploadWebinarCertificate
);

router.get("/get-certificates", getWebinarCertificates);


export default router;
