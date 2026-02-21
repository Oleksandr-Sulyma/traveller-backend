import createHttpError from "http-errors";
import { Story } from "../models/story.js";
import { User } from "../models/user.js";

export const getMyStories = async (req, res) => {
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
};

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

export const getSavedStories = async (req, res) => {
  const userId = req.user._id;
  const { page = 1, perPage = 10 } = req.query;

  const skip = (page - 1) * perPage;

  const user = await User.findById(userId);

  const savedIds = user.savedStories || [];
  const total = savedIds.length;

  const stories = await Story.find({
    _id: { $in: savedIds },
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(perPage);

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