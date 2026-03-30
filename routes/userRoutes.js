import express, { response } from "express";
import { loginSuperAdmin, loginUser, logoutSuperAdmin, logoutUser, registerSuperAdmin, signupUser } from "../controller/userController.js";
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



router.get("/user-info", authMiddleware, (req, res) => {
  res.json({
    status: 200,
    success: true,
    response: req.user
  });
});
export default router