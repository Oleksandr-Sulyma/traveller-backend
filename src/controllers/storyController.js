import createHttpError from "http-errors";
import { Story } from "../models/story.js";

export const getMyStories = async (req, res) => {
  try {
    const { page = 1, perPage = 10 } = req.query;
    const userId = req.user._id;
    const skip = (page - 1) * perPage;

    const stories = await Story.find({ ownerId: userId })
      .populate("category", "name")
      .populate("ownerId", "name avatarUrl")
      .skip(skip)
      .limit(perPage)
      .sort({ favoriteCount: -1, createdAt: -1 });

    const total = await Story.countDocuments({ ownerId: userId });

    res.status(200).json({
      stories: stories || [],
      pagination: {
        page: parseInt(page),
        perPage: parseInt(perPage),
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("Error fetching user's stories:", error);
    throw createHttpError(500, "Failed to fetch user's stories");
  }
};
