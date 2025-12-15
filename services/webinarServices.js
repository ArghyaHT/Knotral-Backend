import Webinars from "../models/webinars.js"

export const createWebinarService = async(data) => {
    const webinar = await Webinars.create(data)

    return webinar;

}


export const geAllWebinarService = async() => {
    const webinars = await Webinars.find({})

    return webinars;

}

export const geAllWebinarByIdService = async(id) => {
    const webinars = await Webinars.findById(id)

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