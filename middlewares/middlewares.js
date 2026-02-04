import jwt from "jsonwebtoken"

//MIDDLEWARE FOR ALL ADMIN PROTECTED ROUTES ==================
export const SuperAdminLoggedIn = async (req, res, next) => {
  try {
    const email = req.email

    // const salon = await getSalonSettings(loggedinAdmin.salonId)

    // Convert Mongoose document to plain object
    const adminData = loggedinAdmin.toObject();

    // Respond with admin and payment details
    res.status(201).json({
      success: true,
      message: "Yes, I am admin logged in",
      response: adminData,
    })

    // if (!admincookie?.AdminToken) {
    //     return res.status(401).json({
    //         success: false,
    //         message: "UnAuthorized Admin"
    //     })
    // }

    // jwt.verify(
    //     admincookie?.AdminToken,
    //     process.env.JWT_ADMIN_ACCESS_SECRET,
    //     async (err, decoded) => {
    //         if (err) return res.status(403).json({ success: false, message: 'Forbidden Admin' })

    //         console.log(decoded)
    //         const adminEmail = decoded.email

    //         const loggedinUser = await findAdminByEmailandRole(adminEmail)

    //        return res.status(201).json({
    //             success: true,
    //             user: [loggedinUser]
    //         })

    //     }
    // )
  }
  catch (error) {
    next(error);
  }

}