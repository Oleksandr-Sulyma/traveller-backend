import createHttpError from "http-errors";
import { Story } from "../models/story.js";
import { User } from "../models/user.js";
import { Category } from "../models/category.js";
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";

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

export const createStory = async (req, res) => {
  const { title, article, category } = req.body;

   const imgBuffer = req.file ? req.file.buffer : null;
   if (!imgBuffer) {
      throw createHttpError(400, "Image file is required");
   }

  const categoryEnity = await Category.findOne({
    name: category
  });

  if (!categoryEnity) {
    throw createHttpError(400, "Invalid category ID");
  }

  try {
    const uploadedImg = await saveFileToCloudinary(imgBuffer);

    if (!uploadedImg || !uploadedImg.secure_url) {
      throw createHttpError(500, "Failed to upload image");
    }

    const newStory = await Story.create({
      title,
      article,
      category: categoryEnity._id,
      img:uploadedImg.secure_url,
      ownerId: req.user._id,
      date: new Date().toISOString(),
    });

    res.status(201).json({
      id: newStory._id,
      title: newStory.title,
      article: newStory.article,
      category: newStory.category,
      ownerId: newStory.ownerId,
      date: newStory.date,
    });
  } catch (error) {
  console.error("Error creating story:", error);
  throw createHttpError(500, "Failed to create story");
  }
};

export const updateStory = async (req, res) => {
  const { storyId } = req.params;
  const { title, article, category } = req.body || {};

  const imgBuffer = req.file ? req.file.buffer : null;

  let uploadedImgUrl = null;
  if (imgBuffer) {
    try {
      const uploadedImg = await saveFileToCloudinary(imgBuffer);
      if (!uploadedImg || !uploadedImg.secure_url) {
        throw createHttpError(500, "Failed to upload image");
      }
      uploadedImgUrl = uploadedImg.secure_url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw createHttpError(500, "Failed to upload image");
    }
  }

  let story;
  try {
        story = await Story.findById(storyId);

    if (!story || story.ownerId.toString() !== req.user._id.toString()) {
      throw createHttpError(404, "Story not found");
    }
  } catch (error) {
    throw createHttpError(404, "Story not found");
  }

 if (category) {
      const categoryEnity = await Category.findOne({        name: category      });

      if (!categoryEnity) {
        throw createHttpError(400, "Invalid category");
      }

      story.category = categoryEnity._id;
    }
  try {
    if (title) story.title = title.trim();
    if (article) story.article = article.trim();
    if (uploadedImgUrl) story.img = uploadedImgUrl;

    await story.save();

    res.status(200).json({
      id: story._id,
      title: story.title,
      article: story.article,
      category: story.category,
       img: story.img,
       ownerId: story.ownerId,
       date: story.date,
    });
  } catch (error) {
    console.error("Error updating story:", error);
    throw createHttpError(500, "Failed to update story");
  }
};
