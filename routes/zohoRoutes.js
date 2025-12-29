import express from "express";
import { createZohoContact, createZohoLead } from "../controller/zohoController.js";

const router = express.Router();
router.route("/register").post(createZohoLead)

router.route("/contact-us").post(createZohoContact)


export default router;