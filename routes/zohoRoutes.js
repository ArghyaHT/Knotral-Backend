import express from "express";
import { createZohoContact, createZohoLead, createZohoSlutionProvidersForm } from "../controller/zohoController.js";

const router = express.Router();
router.route("/register").post(createZohoLead)

router.route("/contact-us").post(createZohoContact)

router.route("/soution-providers-form").post(createZohoSlutionProvidersForm)




export default router;