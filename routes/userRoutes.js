import express, { response } from "express";
import { completeProfile, getUserInfo, getUserRegisteredWebinars, getUserWebinars, loginSuperAdmin, loginUser, logoutSuperAdmin, logoutUser, registerSuperAdmin, resetPassword, signupUser, updateUserProfile } from "../controller/userController.js";
import { refreshSuperAdminToken } from "../middlewares/VerifyRefreshTokenAdmin.js";
import { authMiddleware } from "../middlewares/VerifyTokenUser.js";


const router = express.Router()


router.post("/create-super-admin", registerSuperAdmin);

router.post("/login-super-admin", loginSuperAdmin);

router.post("/refresh-super-admin", refreshSuperAdminToken);

router.post("/logout-super-admin", logoutSuperAdmin);


router.post("/signup-user", signupUser);

router.post("/login-user", loginUser);

router.post("/logout-user", logoutUser);

router.post("/reset-password", resetPassword);


// router.get("/user-info", authMiddleware, (req, res) => {
//   res.json({
//     status: 200,
//     success: true,
//     response: req.user
//   });
// });
router.get("/user-info", authMiddleware, getUserInfo);


router.post("/get-user-webinars", getUserWebinars);

router.post("/get-user-registered-webinars", getUserRegisteredWebinars);

router.put("/update-profile", updateUserProfile);

router.post("/complete-profile", completeProfile);



export default router