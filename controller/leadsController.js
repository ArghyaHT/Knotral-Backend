import Leads from "../models/leads.js";
import SolutionProvider from "../models/solutionProvider.js";

export const getAllLeadsAndProviders = async (req, res, next) => {
  try {
    // Fetch both collections in parallel
    const [leads, solutionProviders] = await Promise.all([
      Leads.find().lean(),
      SolutionProvider.find().lean()
    ]);

    // Add type field (optional but recommended)
    const formattedLeads = leads.map(item => ({
      ...item,
      sourceType: "Lead"
    }));

    const formattedProviders = solutionProviders.map(item => ({
      ...item,
      sourceType: "SolutionProvider"
    }));

    // Merge both arrays
    const mergedData = [...formattedLeads, ...formattedProviders];

    // Sort by createdAt (latest first)
    mergedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: mergedData.length,
      response: mergedData
    });

  } catch (error) {
    next(error);
  }
};