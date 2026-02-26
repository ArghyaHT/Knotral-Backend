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
import { deleteCertificate, getAllCertificates, getWebinarCertificates, sendCertificateEmail, uploadWebinarCertificate } from "../controller/certificatesController.js";
import { getAllLeadsAndProviders } from "../controller/leadsController.js";

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
  upload.single("certificate"),
  uploadWebinarCertificate
);

router.get("/get-all-leads", getAllLeadsAndProviders);

router.get("/get-webinar-certificate", getWebinarCertificates);

router.get("/get-all-certificates", getAllCertificates);

router.delete("/delete-certificate", deleteCertificate);

router.post("/send-certificate-email", sendCertificateEmail);


export default router;
