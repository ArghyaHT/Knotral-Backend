import Webinars from "../models/webinars.js"

export const createWebinarService = async(data) => {
    const webinar = await Webinars.create(data)

    return webinar;

}


export const geAllWebinarService = async() => {
    const webinars = await Webinars.find({})

    return webinars;

}

export const geAllWebinarPaginationService = async (options = {}) => {
  const { skip = 0, countOnly = false } = options;
  const limit = 6; // hardcoded limit

  if (countOnly) {
    // Return total count only
    const totalCount = await Webinars.countDocuments({});
    return totalCount;
  }

  // Fetch paginated webinars
  const webinars = await Webinars.find({})
    .skip(skip)
    .limit(limit)
    .sort({ date: -1 }); // optional: sort by date descending

  return webinars;
};

export const geAllWebinarByIdService = async(id) => {
    const webinars = await Webinars.findById(id)

    return webinars;
}

export const getWebinarBySlugService = async(slug) => {
    const webinars = await Webinars.findOne({slug: slug})

    return webinars;
}

export const searchWebinarsByCategoryService = async (category) => {
  const webinars = await Webinars.find({
    category: { $regex: category, $options: "i" },
  });

  return webinars;
};


export const filterWebinarsService = async (filter) => {
  return await Webinars.find(filter);
};