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


 export const createAllUsers = async(name, email, hashedPassword, mobileNumber , countryCode, userType) => {

   const user = await Users.create({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      countryCode,
      userType,
      isEmailVerified: true
    });
    return user
 }


 export const findUserByEmail= async (email) => {
   const admin = await Users.findOne({ email })
     .exec();
   return admin;
 };