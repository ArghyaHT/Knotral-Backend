import Webinars from "../models/webinars.js"

export const createWebinarService = async (data) => {
  const webinar = await Webinars.create(data)

  return webinar;

}

export const geAllWebinarService = async () => {
  const webinars = await Webinars.find({})

  return webinars;

}

export const getCertifiedWebinarsPaginationService = async ({ skip = 0, limit = 6, countOnly = false }) => {
  const filter = { isCertified: true };

  if (countOnly) {
    return await Webinars.countDocuments(filter);
  }

  return await Webinars.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ date: -1 });
};

export const searchWebinarsWithFilterService = async (filter = {}, options = {}) => {
  const { skip = 0, limit = 6, countOnly = false, sort } = options;

  if (countOnly) {
    // Return total count with filter
    const totalCount = await Webinars.countDocuments(filter);
    return totalCount;
  }

  // Define sort object
  let sortObj = {};
  switch (sort) {
    case "dateNew": sortObj = { date: -1 }; break;  // newest first
    case "dateOld": sortObj = { date: 1 }; break;   // oldest first
    case "popular": sortObj = { views: -1 }; break; // if you track views
    case "provider": sortObj = { organisedBy: 1 }; break; // A-Z
    default: sortObj = { date: 1 }; break;  // default oldest
  }

  // Fetch webinars with filter, pagination
  const webinars = await Webinars.find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sortObj);

  return webinars;
};

export const geAllWebinarByIdService = async (id) => {
  const webinars = await Webinars.findById(id)

  return webinars;
}

export const getWebinarBySlugService = async (slug) => {
  const webinars = await Webinars.findOne({ slug: slug })

  return webinars;
}

export const searchWebinarsByCategoryService = async (category = "", options = {}) => {
  const { skip = 0, limit = 0, countOnly = false } = options;

  const query = category
    ? { category: { $regex: category, $options: "i" } } // filter by category
    : {}; // no category → all webinars

  if (countOnly) {
    // Return total count
    const totalCount = await Webinars.countDocuments(query);
    return totalCount;
  }

  // Fetch paginated webinars
  const webinars = await Webinars.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ date: -1 }); // optional: sort by date descending

  return webinars;
};


export const filterWebinarsService = async (filter) => {
  return await Webinars.find(filter);
};


export const incrementWebinarViewsService = async (webinarId) => {
  if (!webinarId) throw new Error("Webinar ID required");

  const updatedWebinar = await Webinars.findByIdAndUpdate(
    webinarId,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!updatedWebinar) throw new Error("Webinar not found");

  return updatedWebinar;
};


export const updateWebinarService = async (webinarId, updateData) => {
  const webinar = await Webinars.findByIdAndUpdate(
    webinarId,
    {
      $set: updateData,   // replaces provided fields fully
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!webinar) {
    throw new Error("Webinar not found");
  }

  return webinar;
};


export const updateWebinarUtmService = async (webinarId, utmData) => {

  // Remove undefined values (important for partial updates)
  const updateData = Object.fromEntries(
    Object.entries(utmData).filter(([_, value]) => value !== undefined)
  );
  return await Webinars.findByIdAndUpdate(
    webinarId,
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true
    }
  );
};


export const updateWebinarBenefitsService = async (
  webinarId,
  teachersBenifits,
  schoolBenifits,
  resellerBenifits
) => {
  const updatePayload = {};

  if (teachersBenifits) updatePayload.teachersBenifits = teachersBenifits;
  if (schoolBenifits) updatePayload.schoolBenifits = schoolBenifits;
  if (resellerBenifits) updatePayload.resellerBenifits = resellerBenifits;

  return await Webinars.findByIdAndUpdate(
    webinarId,
    updatePayload,
    {
      new: true,
      runValidators: true
    }
  );
};


export const getYoutubeVideoId = (url = "") => {
  if (!url) return "";

  const regExp =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;

  const match = url.match(regExp);
  return match ? match[1] : "";
};


export const stopWebinarService = async (webinarId) => {
  const webinar = await Webinars.findByIdAndUpdate(
    webinarId,
    {
      $set: {
        isStopped: true,
        isLive: false,
        // "actions.canStartProgram": false,
        // "actions.canEnroll": false,
      },
    },
    { new: true }
  );

  return webinar;
};


export const deleteWebinarService = async (webinarId) => {
    if (!webinarId) {
        throw new Error("Webinar ID is required");
    }

    const deletedWebinar = await Webinars.findByIdAndDelete(webinarId);

    if (!deletedWebinar) {
        throw new Error("Webinar not found");
    }

    return deletedWebinar;
};


export const searchPastWebinarsWithFilterService = async (
  filter = {},
  options = {}
) => {
  const {
    skip = 0,
    limit = 6,
    countOnly = false,
    sort = "dateNew",
  } = options;

  // ✅ Count only
  if (countOnly) {
    return await Webinars.countDocuments(filter);
  }

  // ✅ Sorting logic
  let sortObj;
  switch (sort) {
    case "dateNew":
      sortObj = { date: -1 }; // newest first
      break;
    case "dateOld":
      sortObj = { date: 1 }; // oldest first
      break;
    case "popular":
      sortObj = { views: -1 };
      break;
    case "provider":
      sortObj = { organisedBy: 1 }; // A-Z
      break;
    default:
      sortObj = { date: -1 }; // safe default
  }

  // ✅ Fetch webinars
  const webinars = await Webinars.find(filter)
    .sort(sortObj)
    .skip(skip)
    .limit(limit)
    .lean(); // ⚡ performance boost

  return webinars;
};

