// routes/google.routes.js

import express from "express";
import { connectGoogle, googleCallback } from "../controller/googleController.js";
import { googleSignup, googleSignupCallback } from "../controller/userController.js";

const router = express.Router();

router.get("/connect", connectGoogle);
router.get("/callback", googleCallback);

router.get("/google-signup", googleSignup);
router.get("/google-signup/callback", googleSignupCallback);

export default router;