import express from "express";
import { loginSuperAdmin, logoutSuperAdmin, registerSuperAdmin } from "../controller/userController.js";
import { refreshSuperAdminToken } from "../middlewares/VerifyRefreshTokenAdmin.js";


const router = express.Router()


router.post("/create-super-admin", registerSuperAdmin);

router.post("/login-super-admin", loginSuperAdmin);

router.post("/refresh-super-admin", refreshSuperAdminToken);

router.post("/logout-super-admin", logoutSuperAdmin);


export default router