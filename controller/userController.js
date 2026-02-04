import { validateEmail } from "../middlewares/validator.js";
import { createUser, findAdminByEmailandRole } from "../services/userService.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const registerSuperAdmin = async (req, res, next) => {
    try {
        let { email, password, isSuperAdmin } = req.body;

        if (!email && !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password not found",
            });
        }

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is not present",
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email",
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is not present",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters",
            });
        }

        email = email.toLowerCase();

        const existingUser = await findAdminByEmailandRole(email);

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Admin already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await createUser(email, hashedPassword, isSuperAdmin);

        return res.status(200).json({
            success: true,
            message: "Super admin registered successfully",
            response: { newUser },
        });
    } catch (error) {
        next(error);
    }
};


export const loginSuperAdmin = async (req, res, next) => {
    try {
        let { email, password } = req.body;

        /* ---------------- VALIDATIONS ---------------- */

        if (!email && !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password not found"
            });
        }

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is not present"
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email"
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is not present"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        /* ---------------- NORMALIZE EMAIL ---------------- */
        email = email.toLowerCase();

        /* ---------------- FIND USER ---------------- */
        const foundUser = await findAdminByEmailandRole(email);

        if (!foundUser) {
            return res.status(400).json({
                success: false,
                message: "Email or password does not match"
            });
        }

        /* ---------------- PASSWORD CHECK ---------------- */
        const match = await bcrypt.compare(password, foundUser.password);

        if (!match) {
            return res.status(400).json({
                success: false,
                message: "Email or password does not match"
            });
        }

        /* ---------------- JWT TOKEN ---------------- */
        const accessToken = jwt.sign(
            {
                userId: foundUser._id,
                userType: foundUser.userType,
                isSuperAdmin: foundUser.isSuperAdmin,
            },
            process.env.JWT_ADMIN_ACCESS_SECRET,
            { expiresIn: "7d" }
        );

        /* ---------------- SUCCESS RESPONSE ---------------- */
        return res.status(200).json({
            success: true,
            message: "Signin successful",
            response: {
                accessToken,
                foundUser
            }
        });

    } catch (error) {
        next(error);
    }
};
