import { Users } from "../models/user";

export const createUser = async (email, hashedPassword, userType, isSuperAdmin) => {
   const user = new Users({
      email,
      password: hashedPassword,
      role: "Admin",
      userType,
      isSuperAdmin
   })
   await user.save();
   return user;
}


export const findAdminByEmailandRole = async (email) => {
   const admin = await Users.findOne({ email })
     .exec();
   return admin;
 };