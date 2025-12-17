import express from "express";
import { createRegistration } from "../controller/registartionController.js";


const router = express.Router()


router.post("/create-registration", createRegistration);



export default router