import { createUser } from "../services/userService"

export const registerAdmin = async (req, res, next) => {
    try {
        let { email, password, userType, isSuperAdmin} = req.body

        if (!email && !password) {
            return ErrorHandler(EMAIL_AND_PASSWORD_NOT_FOUND_ERROR, ERROR_STATUS_CODE, res)
        }

        if (!email) {
            return ErrorHandler(EMAIL_NOT_PRESENT_ERROR, ERROR_STATUS_CODE, res)
        }

        if (!validateEmail(email)) {
            return ErrorHandler(INVALID_EMAIL_ERROR, ERROR_STATUS_CODE, res)
        }


        if (!password) {
            return ErrorHandler(PASSWORD_NOT_PRESENT_ERROR, ERROR_STATUS_CODE, res)
        }

        if (password.length < 8) {
            return ErrorHandler(PASSWORD_LENGTH_ERROR, ERROR_STATUS_CODE, res)
        }

        email = email.toLowerCase();

        const existingUser = await findAdminByEmailandRole(email)

        if (existingUser) {
            return ErrorHandler(ADMIN_EXISTS_ERROR, ERROR_STATUS_CODE, res)
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await createUser(email, hashedPassword, userType, isSuperAdmin)

        return SuccessHandler(SIGNUP_SUCCESS, SUCCESS_STATUS_CODE, res, { newUser })

    }
    catch (error) {
        next(error);
    }
}

export const loginAdmin = async (req, res, next) => {
    try {
        let { email, password } = req.body

        if (!email && !password) {
            return ErrorHandler(EMAIL_AND_PASSWORD_NOT_FOUND_ERROR, ERROR_STATUS_CODE, res)
        }

        if (!email) {
            return ErrorHandler(EMAIL_NOT_PRESENT_ERROR, ERROR_STATUS_CODE, res)
        }

        if (!validateEmail(email)) {
            return ErrorHandler(INVALID_EMAIL_ERROR, ERROR_STATUS_CODE, res)
        }


        if (!password) {
            return ErrorHandler(PASSWORD_NOT_PRESENT_ERROR, ERROR_STATUS_CODE, res)
        }

        if (password.length < 8) {
            return ErrorHandler(PASSWORD_LENGTH_ERROR, ERROR_STATUS_CODE, res)
        }

        email = email.toLowerCase();

        const foundUser = await findAdminByEmailandRole(email)
        console.log(email)


        if (!foundUser) {
            return ErrorHandler(EMAIL_OR_PASSWORD_DONOT_MATCH_ERROR, ERROR_STATUS_CODE, res)
        }

         if (foundUser.AuthType == "google") {
            return res.status(400).json({
                success: false,
                message: 'Use Google login for this email.'
            })
        }

        const match = await bcrypt.compare(password, foundUser.password)

        if (!match) {
            return ErrorHandler(EMAIL_OR_PASSWORD_DONOT_MATCH_ERROR, ERROR_STATUS_CODE, res)
        }

        const accessToken = jwt.sign(
            {
                "email": foundUser.email,
                "role": foundUser.role
            },
            process.env.JWT_ADMIN_ACCESS_SECRET,
            { expiresIn: '7d' }
        )

        // res.cookie('AdminToken', accessToken, {
        //     httpOnly: true, //accessible only by web server 
        //     secure: true, //https
        //     sameSite: 'None', //cross-site cookie 
        //     maxAge: 1 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
        // })

        return SuccessHandler(SIGNIN_SUCCESS, SUCCESS_STATUS_CODE, res, {
            accessToken,
            foundUser
        })
    }
    catch (error) {
        next(error);
    }
};