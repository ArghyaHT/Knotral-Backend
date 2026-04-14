// routes/google.routes.js

import express from "express";
import { connectGoogle, googleCallback } from "../controller/googleController";

const router = express.Router();

router.get("/connect", connectGoogle);
router.get("/callback", googleCallback);

export default router;