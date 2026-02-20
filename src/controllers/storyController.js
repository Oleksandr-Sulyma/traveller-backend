import createHttpError from "http-errors";
import { Story } from "../models/story.js";

export const getMyStories = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;
    const skip = (page - 1) * limit;

    const stories = await Story.find({ ownerId: userId })
      .populate("category", "name")
      .populate("ownerId", "name avatarUrl")
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });

    const total = await Story.countDocuments({ ownerId: userId });

    res.status(200).json({
      stories: stories || [], // Повертаємо порожній масив, якщо історій немає
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching stories:", error);
    throw createHttpError(500, "Failed to fetch stories");
  }
};
