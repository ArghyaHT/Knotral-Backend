import express from "express";
import { createZohoLead } from "../controller/zohoController.js";

const router = express.Router();
router.route("/register").post(createZohoLead)

export default router;