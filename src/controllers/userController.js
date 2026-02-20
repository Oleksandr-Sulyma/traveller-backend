import { User } from "../models/user.js";
import { Story } from "../models/story.js";
// import createHttpError from "http-errors";

export const addToSaved = async (req, res) => {
  const { storyId } = req.params;
  const userId = req.user._id;

  const story = await Story.findById(storyId);
  if (!story) {
    return res.status(404).json({ message: "Story not found" });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { savedStories: storyId } },
    { new: true },
  ).populate("savedStories");

  res.status(200).json(user.savedStories);
};

export const removeFromSaved = async (req, res) => {
  const { storyId } = req.params;
  const userId = req.user._id;

  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { savedStories: storyId } },
    { new: true },
  ).populate("savedStories");

  res.status(200).json(user.savedStories);
};

//створити ПРИВАТНИЙ ендпоінт для ОТРИМАННЯ збережених історій + пагінація
export const getSavedStories = async (req, res) => {
  const userId = req.user._id;

  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;

  const skip = (page - 1) * perPage;

  const user = await User.findById(userId);

  const total = user.savedStories.length;

  const stories = await Story.find({
    _id: { $in: user.savedStories },
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(perPage);

  res.status(200).json({
    data: stories,
    page,
    perPage,
    total,
    totalPages: Math.ceil(total / perPage),
  });
};
