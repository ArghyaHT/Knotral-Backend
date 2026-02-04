import express from "express";
import { loginSuperAdmin, registerSuperAdmin } from "../controller/userController.js";


const router = express.Router()


router.post("/create-super-admin", registerSuperAdmin);

router.post("/login-super-admin", loginSuperAdmin);


export default router