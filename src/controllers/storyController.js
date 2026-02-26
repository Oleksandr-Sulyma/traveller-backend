import createHttpError from "http-errors";
import { Story } from "../models/story.js";
import { User } from "../models/user.js";
import { Category } from "../models/category.js";
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";
import { uploadFileOrThrowError } from "../utils/uploadFileOrThrowError.js";
import dayjs from "dayjs";


export const getAllStories = async (req, res) => {
  const { page = 1, perPage = 10, category } = req.query;
  const skip = (page - 1) * perPage;

  const storiesQuery = Story.find();

  if (category) storiesQuery.where("category").equals(category);

  const [total, stories] = await Promise.all([
    storiesQuery.clone().countDocuments(),
    storiesQuery
      .clone()
      .skip(skip)
      .limit(Number(perPage))
      .sort({ createdAt: -1 })
      .populate("category", "name")
      .populate("ownerId", "name avatarUrl"),
  ]);

  const formattedStories = stories.map((s) => ({
    ...s.toObject(),
    formattedDate: dayjs(s.date).format("DD.MM.YYYY"),
  }));

  res.status(200).json({
    page: Number(page),
    perPage: Number(perPage),
    total,
    totalPages: Math.ceil(total / perPage),
    stories: formattedStories,
  });
};


export const getStoryById = async (req, res) => {
  const { storyId } = req.params;

  const story = await Story.findById(storyId)
    .populate("category", "name")
    .populate("ownerId", "name avatarUrl");

  if (!story) throw createHttpError(404, "Story not found");

  res.status(200).json({
    ...story.toObject(),
    formattedDate: dayjs(story.date).format("DD.MM.YYYY"),
  });
};


export const getMyStories = async (req, res) => {
  const userId = req.user._id;
  const { page = 1, perPage = 10 } = req.query;
  const skip = (page - 1) * perPage;

  const [total, stories] = await Promise.all([
    Story.countDocuments({ ownerId: userId }),
    Story.find({ ownerId: userId })
      .populate("category", "name")
      .populate("ownerId", "name avatarUrl")
      .skip(skip)
      .limit(Number(perPage))
      .sort({ favoriteCount: -1, createdAt: -1 }),
  ]);

  const formattedStories = stories.map((s) => ({
    ...s.toObject(),
    formattedDate: dayjs(s.date).format("DD.MM.YYYY"),
  }));

  res.status(200).json({
    page: Number(page),
    perPage: Number(perPage),
    total,
    totalPages: Math.ceil(total / perPage),
    stories: formattedStories,
  });
};


export const getSavedStories = async (req, res) => {
  const userId = req.user._id;
  const { page = 1, perPage = 10 } = req.query;
  const skip = (page - 1) * perPage;

  const user = await User.findById(userId);
  if (!user) throw createHttpError(404, "User not found");

  const savedIds = user.savedStories || [];
  const total = savedIds.length;

  const stories = await Story.find({ _id: { $in: savedIds } })
    .populate("category", "name")
    .populate("ownerId", "name avatarUrl")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(perPage));

  const formattedStories = stories.map((s) => ({
    ...s.toObject(),
    formattedDate: dayjs(s.date).format("DD.MM.YYYY"),
  }));

  res.status(200).json({
    page: Number(page),
    perPage: Number(perPage),
    total,
    totalPages: Math.ceil(total / perPage),
    stories: formattedStories,
  });
};


export const addToSave = async (req, res) => {
  const { storyId } = req.params;
  const userId = req.user._id;

  const story = await Story.findById(storyId);
  if (!story) throw createHttpError(404, "Story not found");

  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { savedStories: storyId } },
    { new: true }
  ).populate("savedStories");

  if (!user) throw createHttpError(404, "User not found");

  res.status(200).json(user.savedStories);
};


export const removeFromSave = async (req, res) => {
  const { storyId } = req.params;
  const userId = req.user._id;

  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { savedStories: storyId } },
    { new: true }
  ).populate("savedStories");

  if (!user) throw createHttpError(404, "User not found");

  res.status(200).json(user.savedStories);
};


export const createStory = async (req, res) => {
  const { title, article, category } = req.body;

  const imgBuffer = req.file?.buffer;
  if (!imgBuffer) throw createHttpError(400, "Image file is required");

  const categoryEntity = await Category.findById(category);
  if (!categoryEntity) throw createHttpError(400, "Invalid category ID");

  try {
    const uploadedImg = await saveFileToCloudinary(imgBuffer);
    if (!uploadedImg?.secure_url) throw createHttpError(500, "Failed to upload image");

    const newStory = await Story.create({
      title,
      article,
      category: categoryEntity._id,
      img: uploadedImg.secure_url,
      ownerId: req.user._id,
      date: new Date().toISOString(),
    });

    res.status(201).json({
      _id: newStory._id,
      title: newStory.title,
      article: newStory.article,
      category: newStory.category,
      ownerId: newStory.ownerId,
      img: newStory.img,
      date: dayjs(newStory.date).format("DD.MM.YYYY"),
      favoriteCount: newStory.favoriteCount,
    });
  } catch (error) {
    console.error("Error creating story:", error);
    throw createHttpError(500, "Failed to create story");
  }
};


export const updateStory = async (req, res) => {
  const { storyId } = req.params;
  const { title, article, category } = req.body;
  const imgBuffer = req.file?.buffer;

  let uploadedImgUrl = imgBuffer ? await uploadFileOrThrowError(imgBuffer) : null;

  const story = await Story.findById(storyId);
  if (!story || story.ownerId.toString() !== req.user._id.toString()) {
    throw createHttpError(404, "Story not found");
  }

  if (category) {
    const categoryEntity = await Category.findById(category);
    if (!categoryEntity) throw createHttpError(400, "Invalid category");
    story.category = categoryEntity._id;
  }

  if (title) story.title = title.trim();
  if (article) story.article = article.trim();
  if (uploadedImgUrl) story.img = uploadedImgUrl;

  try {
    await story.save();

    res.status(200).json({
      _id: story._id,
      title: story.title,
      article: story.article,
      category: story.category,
      img: story.img,
      ownerId: story.ownerId,
      date: dayjs(story.date).format("DD.MM.YYYY"),
      favoriteCount: story.favoriteCount,
    });
  } catch (error) {
    console.error("Error updating story:", error);
    throw createHttpError(500, "Failed to update story");
  }
};
