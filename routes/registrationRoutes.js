import express from "express";
import { createRegistration, getRegistrations } from "../controller/registartionController.js";


const router = express.Router()


router.post("/create-registration", createRegistration);

router.post("/get-registrations", getRegistrations);


export default router