import { Users } from "../models/user.js";

export const createUser = async (email, hashedPassword, isSuperAdmin) => {
   const user = new Users({
      email,
      password: hashedPassword,
      userType: "SuperAdmin",
      isSuperAdmin
   })
   await user.save();
   return user;
}


export const findAdminByEmailandRole = async (email) => {
   const admin = await Users.findOne({ email, isSuperAdmin: true })
     .exec();
   return admin;
 };