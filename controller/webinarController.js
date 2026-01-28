import { createWebinarService, filterWebinarsService, geAllWebinarByIdService, geAllWebinarService, getCertifiedWebinarsPaginationService, getWebinarBySlugService, getYoutubeVideoId, incrementWebinarViewsService, searchWebinarsByCategoryService, searchWebinarsWithFilterService, stopWebinarService, updateWebinarBenefitsService, updateWebinarService, updateWebinarUtmService } from "../services/webinarServices.js";
import { v2 as cloudinary } from "cloudinary";


export const createWebinar = async (req, res, next) => {
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

export const createBulkWebinars = async (req, res, next) => {
  try {
    const webinars = req.body;

    if (!Array.isArray(webinars) || webinars.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty array of webinars",
      });
    }

    const created = [];
    const failed = [];

    for (let i = 0; i < webinars.length; i++) {
      try {
        // 🔥 reuse single webinar creation logic
        const webinar = await createWebinarService(webinars[i]);
        created.push(webinar);
      } catch (err) {
        failed.push({
          index: i,
          title: webinars[i]?.title || "Unknown",
          error: err.message,
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Bulk webinar upload completed",
      total: webinars.length,
      created: created.length,
      failed: failed.length,
      response: created,
      errors: failed,
    });
  } catch (error) {
    next(error);
  }
};


export const uploadWebinarLogo = async (req, res, next) => {
  try {
    const { id } = req.body;
    const logoPath = req.file?.path;

    if (!logoPath) {
      return res.status(400).json({ success: false, message: "No logo uploaded" });
    }

    const webinar = await geAllWebinarByIdService(id);
    if (!webinar) {
      return res.status(400).json({ success: false, message: "Webinar not found" });
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

export const uploadWebinarSpeakerImage = async (req, res, next) => {
  try {
    const { webinarId, trainerId } = req.body;
    const image = req.file?.path;

    if (!image) {
      return res.status(400).json({ success: false, message: "No logo uploaded" });
    }

    const webinar = await geAllWebinarByIdService(webinarId);
    if (!webinar) {
      return res.status(400).json({ success: false, message: "Webinar not found" });
    }

    const trainer = webinar.trainer.id(trainerId);


     if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found"
      });
    }

      // 🧹 Remove old image if exists
    if (trainer.trainerImage?.public_id) {
      await cloudinary.uploader.destroy(trainer.trainerImage.public_id);
    }

    const upload = await cloudinary.uploader.upload(image, {
      folder: "webinars/trainers"
    });

    trainer.trainerImage = {
      public_id: upload.public_id,
      url: upload.secure_url
    };

    await webinar.save();

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      response: trainer.trainerImage ,
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

export const getAllWebinarsByPagination = async (req, res, next) => {
  try {
    const {
      page,
      category,
      type,
      price,
      search,
      sort
    } = req.query;

    const currentPage = parseInt(page) || 1;
    const limit = 6; // default limit
    const skip = (currentPage - 1) * limit;

    // Build filter object dynamically
    let filter = {};

    if (category) filter.category = category;

    if (type) {
      switch (type.toLowerCase()) {
        case "live":
          filter.isLive = true;
          break;
        case "certified":
          filter.isCertified = true;
          break;
        case "ondemand":
          filter.isOnDemand = true;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid filter type",
          });
      }
    }

    // ✅ PRICE → isFree mapping
    if (price) {
      if (price === "free") {
        filter.isFree = true;
      } else if (price === "paid") {
        filter.isFree = false;
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid price filter. Use 'free' or 'paid'",
        });
      }
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { organisedBy: { $regex: search, $options: "i" } },
      ];
    }

    // Fetch webinars with filter and pagination
    const webinars = await searchWebinarsWithFilterService(filter, { skip, limit, sort });

    // Count total items with the same filter (for pagination)
    const totalItems = await searchWebinarsWithFilterService(filter, { countOnly: true });
    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      message: "Webinars retrieved successfully",
      response: webinars,
      pagination: {
        page: currentPage,
        limit,
        totalPages,
        totalItems,
      },
    });
  } catch (error) {
    next(error);
  }
}


export const getAllCertifiedWebinarsByPagination = async (req, res, next) => {
  try {
    const { page } = req.query;

    const currentPage = parseInt(page) || 1;
    const limit = 6;
    const skip = (currentPage - 1) * limit;

    // 🔹 Certified filter
    const filter = { isCertified: true };

   const webinars = await getCertifiedWebinarsPaginationService({
      skip,
      limit,
    });

   
    const totalItems = await getCertifiedWebinarsPaginationService({
      countOnly: true,
    });

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      message: "Certified webinars retrieved successfully",
      response: webinars,
      pagination: {
        page: currentPage,
        limit,
        totalPages,
        totalItems,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getWebinarsById = async (req, res, next) => {
  try {
    const { _id } = req.body;

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
    const { category, page } = req.query;

    const currentPage = parseInt(page) || 1;
    const limit = 6; // hardcoded limit
    const skip = (currentPage - 1) * limit;

    let webinars, totalItems;

    if (category) {
      // Fetch webinars by category
      webinars = await searchWebinarsByCategoryService(category, { skip, limit });
      totalItems = await searchWebinarsByCategoryService(category, { countOnly: true });
    } else {
      // No category provided → fetch all webinars with pagination
      webinars = await geAllWebinarPaginationService({ skip, limit });
      totalItems = await geAllWebinarPaginationService({ countOnly: true });
    }

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      message: "Webinars fetched successfully",
      response: webinars,
      pagination: {
        page: currentPage,
        limit,
        totalPages,
        totalItems,
      },
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


export const incrementWebinarViews = async (req, res, next) => {
  try {
    const { webinarId } = req.body;

    const updatedWebinar = await incrementWebinarViewsService(webinarId);

    res.status(200).json({
      success: true,
      response: updatedWebinar.views,
    });
  } catch (error) {
    next(error); // will be handled by your error middleware
  }
};


export const addTrainerToWebinar = async (req, res, next) => {
  try {
    const { webinarId, trainerName, designation, worksAt, description } = req.body;
    const trainerImagePath = req.file?.path;

    if (!webinarId || !trainerName) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const webinar = await geAllWebinarByIdService(webinarId);

    if (!webinar) {
      return res.status(400).json({ success: false, message: "Webinar not found" });
    }

    let trainerImage = {
      public_id: "",
      url: "https://res.cloudinary.com/dpynxkjfq/image/upload/v1720520065/default-avatar-icon-of-social-media-user-vector_wl5pm0.jpg"
    };

    if (trainerImagePath) {
      const upload = await cloudinary.uploader.upload(trainerImagePath, {
        folder: "webinars/trainers",
      });
      trainerImage = { public_id: upload.public_id, url: upload.secure_url };
    }

    webinar.trainer.push({
      trainerName,
      designation,
      worksAt,
      description,
      trainerImage,
    });

    await webinar.save();

    res.status(200).json({
      success: true,
      message: "Trainer added successfully",
      trainer: webinar.trainer,
    });
  } catch (error) {
    console.log(error)
    next(error);
  }
};


export const uploadWebinarOg = async (req, res, next) => {
  try {
    const { id } = req.body;
    const ogPath = req.file?.path;

    console.log(ogPath)

    if (!ogPath) {
      return res.status(400).json({ success: false, message: "No OG image uploaded" });
    }

    const webinar = await geAllWebinarByIdService(id);
    if (!webinar) {
      return res.status(400).json({ success: false, message: "Webinar not found" });
    }

    // Delete old OG image if exists
    if (webinar.ogImage?.public_id) {
      await cloudinary.uploader.destroy(webinar.ogImage.public_id);
    }

    // Upload new OG image to Cloudinary
    const upload = await cloudinary.uploader.upload(ogPath, {
      folder: "webinars/ogImages",
    });

    webinar.ogImage = {
      public_id: upload.public_id,
      url: upload.secure_url,
    };

    await webinar.save();

    res.status(200).json({
      success: true,
      message: "OG image uploaded successfully",
      response: webinar.ogImage,
    });
  } catch (error) {
    next(error);
  }
};


export const updateWebinar = async (req, res, next) => {
  try {
    const { webinarId } = req.body;

    const webinar = await updateWebinarService(webinarId, req.body);

    return res.status(200).json({
      success: true,
      message: "Webinar updated successfully",
      response: webinar,
    });
  } catch (error) {
    next(error);
  }
};


export const updateWebinarUtm = async (req, res, next) => {
  try {
    const { webinarId, utm_source, utm_medium, utm_campaign } = req.body;

    if (!webinarId) {
      return res.status(400).json({
        success: false,
        message: "webinarId is required",
      });
    }

    const webinar = await updateWebinarUtmService(webinarId, {
      utm_source,
      utm_medium,
      utm_campaign,
    });

    if (!webinar) {
      return res.status(404).json({
        success: false,
        message: "Webinar not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "UTM details updated successfully",
      response: webinar,
    });
  } catch (error) {
    next(error);
  }
};


export const updateWebinarSchema = async (req, res, next) => {
  try {
    const { webinarId, teachersBenifits,
      schoolBenifits,
      resellerBenifits } = req.body;

    if (!webinarId) {
      return res.status(400).json({
        success: false,
        message: "Webinar ID is required",
      });
    }


    const webinar = await updateWebinarBenefitsService(webinarId, teachersBenifits, schoolBenifits, resellerBenifits)

    if (!webinar) {
      return res.status(404).json({
        success: false,
        message: "Webinar not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Training benifits updated successfully",
      response: webinar,
    });
  } catch (error) {
    next(error);
  }
};



export const addPastSession = async (req, res, next) => {
  try {
    const { webinarId, youtubeUrl, title, date } = req.body;

    if (!youtubeUrl || !title) {
      return res.status(400).json({
        success: false,
        message: "YouTube URL and title are required",
      });
    }

    const youtubeId = getYoutubeVideoId(youtubeUrl);

    if (!youtubeId) {
      return res.status(400).json({
        success: false,
        message: "Invalid YouTube URL",
      });
    }

    const webinar = await geAllWebinarByIdService(webinarId);

    if (!webinar) {
      return res.status(404).json({
        success: false,
        message: "Webinar not found",
      });
    }

    webinar.pastSessions.push({
      youtubeId,
      title,
      date: date ? new Date(date) : new Date(),
    });

    await webinar.save();

    return res.status(200).json({
      success: true,
      message: "Past session added successfully",
      response: webinar.pastSessions,
    });
  } catch (error) {
    next(error);
  }
};

export const stopWebinar = async(req, res, next) => {
 try {
    const { webinarId } = req.body;

    const webinar = await stopWebinarService(webinarId);

    if (!webinar) {
      return res.status(400).json({
        success: false,
        message: "Webinar not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Campaign stopped successfully",
      response: webinar,
    });
  }
  catch (error) {
    next(error);
  }
}

