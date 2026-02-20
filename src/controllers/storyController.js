import createHttpError  from "http-errors";
import {Story} from "../models/story.js";

export const getMyStories = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const userId = req.user._id;
  const skip = (page - 1) * limit;

  const stories = await Story.find({ ownerId: userId })
    .populate("category", "name")
    .populate("ownerId", "name avatarUrl")
    .skip(skip)
    .limit(limit)
    .sort({ favoriteCount: -1, createdAt: -1 });

  const total = await Story.countDocuments({ ownerId: userId });

  res.status(200).json({
    stories: stories || [],
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
};
