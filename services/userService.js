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


export const createAllUsers = async (firstName, lastName, email, hashedPassword, mobileNumber, countryCode, roleDescription, otherRoleDescription, organizationName) => {

  const user = await Users.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    mobileNumber,
    countryCode,
    authType: "local",
    isEmailVerified: true,
    roleDescription,
    otherRoleDescription,
    organizationName,
  });
  return user
}


export const findUserByEmail = async (email) => {
  const admin = await Users.findOne({ email })
    .exec();
  return admin;
};