import { User } from "../models/user.js";
import { Story } from "../models/story.js";

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
    { new: true }
  ).populate("savedStories");

  res.status(200).json(user.savedStories);
};

export const removeFromSaved = async (req, res) => {
  const { storyId } = req.params;
  const userId = req.user._id;

  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { savedStories: storyId } },
    { new: true }
  ).populate("savedStories");

  res.status(200).json(user.savedStories);
};