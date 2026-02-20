import createHttpError from "http-errors";
import { Story } from "../models/story.js";
import { Category } from "../models/category.js";

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
  } catch (error) {
    console.error("Error fetching user's stories:", error);
    throw createHttpError(500, "Failed to fetch user's stories");
  }
};

export const getAllStories = async (req, res) => {
  const { page = 1, perPage = 10, category } = req.query;
  const skip = (page - 1) * perPage;

  const storiesQuery = Story.find();

  if (category) {
    storiesQuery.where("category").equals(category);
  }

  const [totalStories, stories] = await Promise.all([
    storiesQuery.clone().countDocuments(),
    storiesQuery
      .clone()
      .skip(skip)
      .limit(Number(perPage))
      .sort({ createdAt: -1 })
      .populate("category", "name")
      .populate("ownerId", "name"),
  ]);

  const totalPages = Math.ceil(totalStories / perPage);

  res.status(200).json({
    page: Number(page),
    perPage: Number(perPage),
    totalStories,
    totalPages,
    stories,
  });
};
