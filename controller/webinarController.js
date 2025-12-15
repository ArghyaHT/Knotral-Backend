import { createWebinarService, filterWebinarsService, geAllWebinarByIdService, geAllWebinarService, getWebinarBySlugService, searchWebinarsByCategoryService } from "../services/webinarServices.js";
import { v2 as cloudinary } from "cloudinary";


export const createWebinar = async(req, res, next) => {
    try {
    const webinar = await createWebinarService(req.body)

    return res.status(200).json({
      success: true,
      message: "Webinar created successfully",
      response: webinar,
    });
  } catch (error) {
        next(error);
    }
}


export const uploadWebinarLogo = async (req, res, next) => {
  try {
    const { id } = req.body;
    const logoPath = req.file?.path;

    if (!logoPath) {
      return res.status(400).json({ success: false, message: "No logo uploaded" });
    }

    const webinar = await geAllWebinarByIdService(id);
    if (!webinar) {
      return res.status(404).json({ success: false, message: "Webinar not found" });
    }

    // Delete old logo if exists
    if (webinar.logo?.public_id) {
      await cloudinary.uploader.destroy(webinar.logo.public_id);
    }

    // Upload new logo to Cloudinary
    const upload = await cloudinary.uploader.upload(logoPath, {
      folder: "webinars/logos",
    });

    webinar.logo = {
      public_id: upload.public_id,
      url: upload.secure_url,
    };

    await webinar.save();

    res.status(200).json({
      success: true,
      message: "Logo uploaded successfully",
      response: webinar.logo,
    });
  } catch (error) {
    next(error);
  }
};



export const getAllWebinars = async (req, res, next) => {
  try {
    const webinars = await geAllWebinarService();

    return res.status(200).json({
      success: true,
      message: "Webinars retrieved successfully",
      response: webinars,
    });
  } catch (error) {
    next(error);
  }
};

export const getWebinarsById = async (req, res, next) => {
  try {
    const {_id} = req.body;

    const webinar = await geAllWebinarByIdService(_id)

    return res.status(200).json({
      success: true,
      message: "Webinars retrieved successfully",
      response: webinar,
    });
  } catch (error) {
    next(error);
  }
};

export const getWebinarsBySlug = async (req, res, next) => {
  try {
    const { slug } = req.query; // or req.params

    const webinar = await getWebinarBySlugService(slug);

    if (!webinar) {
      return res.status(400).json({
        success: false,
        message: "Webinar not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Webinar retrieved successfully",
      response: webinar,
    });
  } catch (error) {
    console.log(error)
    next(error);
  }
};

export const searchWebinarsByCategory = async (req, res, next) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const webinars = await searchWebinarsByCategoryService(category);

    return res.status(200).json({
      success: true,
      message: "Webinars fetched successfully",
      count: webinars.length,
      response: webinars,
    });
  } catch (error) {
    next(error);
  }
};


export const filterWebinars = async (req, res, next) => {
  try {
    const { type } = req.query;

    console.log(type)

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Filter type is required",
      });
    }

    let filter = {};

    switch (type) {
      case "live":
        filter = { isLive: true };
        break;

      case "certified":
        filter = { isCertified: true };
        break;

      case "ondemand":
        filter = { isOnDemand: true };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid filter type",
        });
    }

    const webinars = await filterWebinarsService(filter);

    return res.status(200).json({
      success: true,
      message: "Webinars retrieved successfully",
      count: webinars.length,
      response: webinars,
    });
  } catch (error) {
    next(error);
  }
};



