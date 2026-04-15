// routes/google.routes.js

import express from "express";
import { connectGoogle, googleCallback, googleLogin, googleSignup } from "../controller/googleController.js";

const router = express.Router();

router.get("/google-login", googleLogin);
router.get("/google-signup", googleSignup);

router.get("/connect", connectGoogle);
router.get("/callback", googleCallback);



export default router;