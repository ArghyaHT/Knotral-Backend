import { response } from "express";
import { createWebinarService, deleteWebinarService, filterWebinarsService, geAllWebinarByIdService, geAllWebinarService, getCertifiedWebinarsPaginationService, getWebinarBySlugService, getYoutubeVideoId, incrementWebinarViewsService, searchPastWebinarsWithFilterService, searchWebinarsByCategoryService, searchWebinarsWithFilterService, stopWebinarService, updateWebinarBenefitsService, updateWebinarService, updateWebinarUtmService } from "../services/webinarServices.js";
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

export const updateWebinarSpeaker = async (req, res, next) => {
  try {
    const { webinarId, trainers } = req.body; // trainers is an array of trainer objects
    // Each trainer object can have: trainerId, trainerName, designation, worksAt, description
    // If an image is uploaded, req.files will contain them keyed by index or trainerId

    if (!webinarId) {
      return res.status(400).json({
        success: false,
        message: "Webinar ID is required",
      });
    }

    if (!Array.isArray(trainers) || trainers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Trainers array is required",
      });
    }

    const webinar = await geAllWebinarByIdService(webinarId);
    if (!webinar) {
      return res.status(404).json({
        success: false,
        message: "Webinar not found",
      });
    }

    // Collect IDs of trainers sent from frontend (only existing trainers)
    const incomingTrainerIds = trainers
      .filter(t => t.trainerId)
      .map(t => t.trainerId);

    // ===================== DELETE REMOVED TRAINERS =====================
    webinar.trainer = webinar.trainer.filter(t =>
      incomingTrainerIds.includes(t._id.toString())
    );

    // ===================== ADD OR UPDATE TRAINERS =====================
    for (const trainerData of trainers) {
      let trainer;

      // Update existing trainer
      if (trainerData.trainerId) {
        trainer = webinar.trainer.id(trainerData.trainerId);
        if (!trainer) continue; // should not happen
      } 
      // Add new trainer
      else {
        trainer = {
          trainerName: "",
          designation: "",
          worksAt: "",
          description: "",
          trainerImage: {
            public_id: "",
            url: "",
          },
        };
        webinar.trainer.push(trainer);
        trainer = webinar.trainer[webinar.trainer.length - 1];
      }

      // Update text fields
      trainer.trainerName = trainerData.trainerName || trainer.trainerName;
      trainer.designation = trainerData.designation || trainer.designation;
      trainer.worksAt = trainerData.worksAt || trainer.worksAt;
      trainer.description = trainerData.description || trainer.description;

      // Handle image if sent (assuming each trainerData has imagePath)
      if (trainerData.imagePath) {
        // delete old image if exists
        if (trainer.trainerImage?.public_id) {
          await cloudinary.uploader.destroy(trainer.trainerImage.public_id);
        }

        const upload = await cloudinary.uploader.upload(trainerData.imagePath, {
          folder: "webinars/trainers",
        });

        trainer.trainerImage = {
          public_id: upload.public_id,
          url: upload.secure_url,
        };
      } 
      // if no image, set default only if empty
      else if (!trainer.trainerImage?.url) {
        trainer.trainerImage = {
          public_id: "",
          url: "https://res.cloudinary.com/dpynxkjfq/image/upload/v1720520065/default-avatar-icon-of-social-media-user-vector_wl5pm0.jpg",
        };
      }
    }

    webinar.markModified("trainer");
    await webinar.save();

    res.status(200).json({
      success: true,
      message: "Trainers updated successfully",
      trainers: webinar.trainer,
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

export const getLiveWebinarsByPagination = async (req, res, next) => {
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
    let filter = {  isStopped: false,} 

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
        case "completed":
          filter.isStopped = true;
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
    const { webinarId, pastSessions } = req.body;

    if (!webinarId || !Array.isArray(pastSessions)) {
      return res.status(400).json({
        success: false,
        message: "Webinar ID and pastSessions array are required",
      });
    }

    const webinar = await geAllWebinarByIdService(webinarId);

    if (!webinar) {
      return res.status(404).json({
        success: false,
        message: "Webinar not found",
      });
    }

    /* ---------------- VALIDATE & TRANSFORM ---------------- */
    const updatedPastSessions = pastSessions.map((session, index) => {
      const { title, youtubeUrl, date } = session;

      if (!title || !youtubeUrl) {
        throw new Error(`Title and YouTube URL are required for session ${index + 1}`);
      }

      const youtubeId = getYoutubeVideoId(youtubeUrl);

      if (!youtubeId) {
        throw new Error(`Invalid YouTube URL for session: ${title}`);
      }

      return {
        title,
        youtubeId,                 // store only ID
        date: date ? new Date(date) : new Date(),
      };
    });

    /* ---------------- REPLACE ARRAY (NOT PUSH) ---------------- */
    webinar.pastSessions = updatedPastSessions;

    await webinar.save();

    return res.status(200).json({
      success: true,
      message: "Past sessions updated successfully",
      pastSessions: webinar.pastSessions,
    });

  } catch (error) {
    console.error("Add Past Sessions Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};


export const stopWebinar = async (req, res, next) => {
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

export const deleteWebinar = async (req, res, next) => {
  try {
    const { webinarId } = req.body;

    if (!webinarId) {
      return res.status(400).json({
        success: false,
        message: "webinarId is required",
      });
    }

    const deletedWebinar = await deleteWebinarService(webinarId);

    res.status(200).json({
      success: true,
      message: "Webinar deleted successfully",
      response: deletedWebinar
    });
  } catch (error) {
    next(error);
  }
};


export const getPastWebinarsByPagination = async (req, res, next) => {
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
    let filter = {
      isStopped: true,
      isLive: false,
    };

    if (category) filter.category = category;

    if (type) {
      switch (type.toLowerCase()) {
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
    const webinars = await searchPastWebinarsWithFilterService(filter, { skip, limit, sort });

    // Count total items with the same filter (for pagination)
    const totalItems = await searchPastWebinarsWithFilterService(filter, { countOnly: true });
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
        case "completed":
          filter.isStopped = true;
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
