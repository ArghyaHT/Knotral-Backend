import express from "express";
import { loginSuperAdmin, loginUser, logoutSuperAdmin, registerSuperAdmin, signupUser } from "../controller/userController.js";
import { refreshSuperAdminToken } from "../middlewares/VerifyRefreshTokenAdmin.js";


const router = express.Router()


router.post("/create-super-admin", registerSuperAdmin);

router.post("/login-super-admin", loginSuperAdmin);

router.post("/refresh-super-admin", refreshSuperAdminToken);

router.post("/logout-super-admin", logoutSuperAdmin);


router.post("/signup-user", signupUser);

router.post("/login-user", loginUser);


export default router