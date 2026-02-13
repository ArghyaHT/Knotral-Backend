import { v2 as cloudinary } from "cloudinary";
import { Certificates } from "../models/certificates.js";
import { geAllWebinarByIdService } from "../services/webinarServices.js";
import mongoose from "mongoose";

export const uploadWebinarCertificate = async (req, res, next) => {
    try {
        const { webinarId } = req.body;
        const certificatePath = req.file?.path;

        if (!certificatePath) {
            return res.status(400).json({
                success: false,
                message: "No certificate file uploaded",
            });
        }

        // Check if webinar exists
        const webinar = await geAllWebinarByIdService(webinarId);
        if (!webinar) {
            return res.status(400).json({
                success: false,
                message: "Webinar not found",
            });
        }

        // Check if certificate already exists for this webinar
        let existingCertificate = await Certificates.findOne({ webinarId });

        // Delete old certificate from Cloudinary if exists
        if (existingCertificate?.certificateFile?.public_id) {
            await cloudinary.uploader.destroy(
                existingCertificate.certificateFile.public_id,
                { resource_type: "image" },
            );
        }

        const upload = await cloudinary.uploader.upload(certificatePath, {
            folder: "webinars/certificates",
            resource_type: "image",   // keep this
            type: "upload",         // 🔥 THIS MAKES IT PUBLIC
        });

        // If certificate exists → update
        if (existingCertificate) {
            existingCertificate.certificateFile = {
                public_id: upload.public_id,
                url: upload.secure_url,
                format: upload.format,
                resource_type: upload.resource_type,
            };

            await existingCertificate.save();

            return res.status(200).json({
                success: true,
                message: "Certificate updated successfully",
                response: existingCertificate,
            });
        }

        // Else create new certificate
        const newCertificate = await Certificates.create({
            webinarId,
            webinarOrganiser: webinar.organisedBy || "Unknown",
            certificateFile: {
                public_id: upload.public_id,
                url: upload.secure_url,
                format: upload.format,
                resource_type: upload.resource_type,
            },
        });

        res.status(200).json({
            success: true,
            message: "Certificate uploaded successfully",
            response: newCertificate,
        });
    } catch (error) {
        next(error);
    }
};

export const getWebinarCertificates = async (req, res, next) => {
    try {
        const { webinarId } = req.query;

        console.log(webinarId)

        if (!mongoose.Types.ObjectId.isValid(webinarId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Webinar ID",
            });
        }

        const certificate = await Certificates.findOne({
            webinarId,
        });

        if (!certificate) {
            return res.status(200).json({
                success: true,
                certificate: null,
            });
        }

        return res.status(200).json({
            success: true,
            response: certificate,
        });

    } catch (error) {
        next(error);
    }
};

