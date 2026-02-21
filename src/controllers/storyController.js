import createHttpError from "http-errors";
import { Story } from "../models/story.js";
import { User } from "../models/user.js";

// 1. Отримання всіх історій (Публічний)
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

// 2. Отримання однієї історії за ID (Публічний)
export const getStoryById = async (req, res) => {
  const { storyId } = req.params;

  const story = await Story.findById(storyId)
    .populate("category", "name")
    .populate("ownerId", "name avatarUrl");

  if (!story) {
    throw createHttpError(404, "Story not found");
  }

  res.status(200).json(story);
};

// 3. Отримання власних історій (Приватний)
export const getMyStories = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;
  const userId = req.user._id;
  const skip = (page - 1) * perPage;

  const stories = await Story.find({ ownerId: userId })
    .populate("category", "name")
    .populate("ownerId", "name avatarUrl")
    .skip(skip)
    .limit(Number(perPage))
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
};

// 4. Додавання до збережених (Приватний)
export const addToSave = async (req, res) => {
  const { storyId } = req.params;
  const userId = req.user._id;

  const story = await Story.findById(storyId);
  if (!story) {
    throw createHttpError(404, "Story not found");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { savedStories: storyId } },
    { new: true },
  ).populate("savedStories");

  res.status(200).json(user.savedStories);
};

// 5. Видалення зі збережених (Приватний)
export const removeFromSave = async (req, res) => {
  const { storyId } = req.params;
  const userId = req.user._id;

  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { savedStories: storyId } },
    { new: true },
  ).populate("savedStories");

  res.status(200).json(user.savedStories);
};

// 6. Отримання збережених історій (Приватний)
export const getSavedStories = async (req, res) => {
  const userId = req.user._id;
  const { page = 1, perPage = 10 } = req.query;
  const skip = (page - 1) * perPage;

  const user = await User.findById(userId);
  if (!user) throw createHttpError(404, "User not found");

  const savedIds = user.savedStories || [];
  const total = savedIds.length;

  const stories = await Story.find({ _id: { $in: savedIds } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(perPage));

  res.status(200).json({
    data: stories,
    pagination: {
      page: parseInt(page),
      perPage: parseInt(perPage),
      total,
      totalPages: Math.ceil(total / perPage),
    },
  });
};