import express from "express";
import { getWebinarCertificates } from "../controller/certificatesController.js";

const router = express.Router()


router.get("/get-webinar-certificate", getWebinarCertificates);


export default router