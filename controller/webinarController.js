import { createWebinarService, filterWebinarsService, geAllWebinarByIdService, geAllWebinarService, getCertifiedWebinarsPaginationService, getWebinarBySlugService, searchWebinarsByCategoryService, searchWebinarsWithFilterService } from "../services/webinarServices.js";
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

// export const getAllWebinarsByPagination = async (req, res, next) => {
//   try {
//     const page = parseInt(req.query.page) || 1; // default to page 1
//     const skip = (page - 1) * 6; // 6 is hardcoded in service

//     // Fetch webinars with pagination
//     const webinars = await geAllWebinarPaginationService({ skip });

//     // Get total count to calculate total pages
//     const totalWebinars = await geAllWebinarPaginationService({ countOnly: true });
//     const totalPages = Math.ceil(totalWebinars / 6);

//     return res.status(200).json({
//       success: true,
//       message: "Webinars retrieved successfully",
//       response: webinars,
//       pagination: {
//         page,
//         limit: 6,
//         totalPages,
//         totalItems: totalWebinars,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const getAllWebinarsByPagination = async (req, res, next) => {
  try {
    const {
      page,
      category,
      type,
      price,
      search,
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
    const webinars = await searchWebinarsWithFilterService(filter, { skip, limit });

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



