import createHttpError from 'http-errors';
import { Story } from '../models/story.js';
import { User } from '../models/user.js';
import { Category } from '../models/category.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { uploadFileOrThrowError } from '../utils/uploadFileOrThrowError.js';
import dayjs from 'dayjs';

// --- ДОПОМІЖНА ФУНКЦІЯ ФОРМАТУВАННЯ ---
const formatStory = (storyObject) => {
  const story = storyObject.toObject ? storyObject.toObject() : storyObject;
  const { _id, __v, ownerId, ...rest } = story;

  return {
    ...rest,
    id: _id,
    category: story.category?._id
      ? { id: story.category._id, name: story.category.name }
      : story.category,
    owner: ownerId?._id
      ? {
          id: ownerId._id,
          name: ownerId.name,
          avatarUrl: ownerId.avatarUrl,
        }
      : ownerId,
    formattedDate: dayjs(story.date).format('DD.MM.YYYY'),
  };
};

// --- ОТРИМАТИ ВСІ ІСТОРІЇ ---
export const getAllStories = async (req, res) => {
  const {
    page = 1,
    perPage = 10,
    category,
    author,
    favorite,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(Math.max(1, Number(perPage)), 100);
  const skip = (pageNum - 1) * limitNum;

  let filter = {};
  if (category) filter.category = category;
  if (author) filter.ownerId = author;

  if (favorite === 'true' && req.user?._id) {
    const user = await User.findById(req.user._id);
    if (user?.savedStories?.length) {
      filter._id = { $in: user.savedStories };
    } else {
      return res.status(200).json({
        page: pageNum,
        perPage: limitNum,
        total: 0,
        totalPages: 0,
        stories: [],
      });
    }
  }

  const [total, stories] = await Promise.all([
    Story.countDocuments(filter),
    Story.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .populate('category', 'name')
      .populate('ownerId', 'name avatarUrl email'),
  ]);

  res.status(200).json({
    page: pageNum,
    perPage: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
    stories: stories.map(formatStory),
  });
};

// --- ОТРИМАТИ ОДНУ ІСТОРІЮ ---
export const getStoryById = async (req, res) => {
  const { id } = req.params;
  const story = await Story.findById(id)
    .populate('category', 'name')
    .populate('ownerId', 'name avatarUrl');

  if (!story) throw createHttpError(404, 'Story not found');

  res.status(200).json(formatStory(story));
};

// --- ВЛАСНІ ІСТОРІЇ КОРИСТУВАЧА ---
export const getOwnStories = async (req, res) => {
  const userId = req.user._id;
  const { page = 1, perPage = 10 } = req.query;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(Math.max(1, Number(perPage)), 100);
  const skip = (pageNum - 1) * limitNum;

  const [total, stories] = await Promise.all([
    Story.countDocuments({ ownerId: userId }),
    Story.find({ ownerId: userId })
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 })
      .populate('category', 'name')
      .populate('ownerId', 'name avatarUrl'),
  ]);

  res.status(200).json({
    page: pageNum,
    perPage: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
    stories: stories.map(formatStory),
  });
};

// --- ЗБЕРЕЖЕНІ ІСТОРІЇ ---
export const getSavedStories = async (req, res) => {
  const userId = req.user._id;
  const { page = 1, perPage = 10 } = req.query;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(Math.max(1, Number(perPage)), 100);
  const skip = (pageNum - 1) * limitNum;

  const user = await User.findById(userId);
  if (!user) throw createHttpError(404, 'User not found');

  const savedIds = user.savedStories || [];
  const total = savedIds.length;

  const stories = await Story.find({ _id: { $in: savedIds } })
    .populate('category', 'name')
    .populate('ownerId', 'name avatarUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    page: pageNum,
    perPage: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
    stories: stories.map(formatStory),
  });
};

// --- ДОДАТИ В ОБРАНЕ ---
export const addToSave = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const story = await Story.findById(id);
  if (!story) throw createHttpError(404, 'Story not found');

  const [updatedUser] = await Promise.all([
    User.findByIdAndUpdate(
      userId,
      { $addToSet: { savedStories: id } },
      { new: true },
    ).populate('savedStories'),
    Story.findByIdAndUpdate(id, { $inc: { favoriteCount: 1 } }),
  ]);

  if (!updatedUser) throw createHttpError(404, 'User not found');

  res.status(200).json(updatedUser.savedStories);
};

// --- ВИДАЛИТИ З ОБРАНОГО ---
export const removeFromSave = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) throw createHttpError(404, 'User not found');

  const wasSaved = user.savedStories.includes(id);

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $pull: { savedStories: id } },
    { new: true },
  ).populate('savedStories');

  if (wasSaved) {
    await Story.findByIdAndUpdate(id, { $inc: { favoriteCount: -1 } });
  }

  res.status(200).json(updatedUser.savedStories);
};

// --- СТВОРИТИ ІСТОРІЮ ---
export const createStory = async (req, res) => {
  const { title, article, category } = req.body;
  const imgBuffer = req.file?.buffer;

  if (!imgBuffer) throw createHttpError(400, 'Image file is required');

  const categoryEntity = await Category.findById(category);
  if (!categoryEntity) throw createHttpError(400, 'Invalid category ID');

  const uploadedImg = await saveFileToCloudinary(imgBuffer);
  if (!uploadedImg?.secure_url)
    throw createHttpError(500, 'Failed to upload image');

  const newStory = await Story.create({
    title,
    article,
    category: categoryEntity._id,
    img: uploadedImg.secure_url,
    ownerId: req.user._id,
    date: new Date().toISOString(),
  });

  const populatedStory = await Story.findById(newStory._id)
    .populate('category', 'name')
    .populate('ownerId', 'name avatarUrl');

  res.status(201).json(formatStory(populatedStory));
};

// --- ОНОВИТИ ІСТОРІЮ ---
export const updateStory = async (req, res) => {
  const { id } = req.params;
  const { title, article, category } = req.body;
  const imgBuffer = req.file?.buffer;

  const story = await Story.findById(id);
  if (!story) throw createHttpError(404, 'Story not found');
  if (story.ownerId.toString() !== req.user._id.toString()) {
    throw createHttpError(403, 'Forbidden: You are not the owner');
  }

  if (category) {
    const categoryEntity = await Category.findById(category);
    if (!categoryEntity) throw createHttpError(400, 'Invalid category');
    story.category = categoryEntity._id;
  }

  if (title) story.title = title.trim();
  if (article) story.article = article.trim();

  if (imgBuffer) {
    const uploadedImgUrl = await uploadFileOrThrowError(imgBuffer);
    story.img = uploadedImgUrl;
  }

  await story.save();

  const updatedStory = await Story.findById(id)
    .populate('category', 'name')
    .populate('ownerId', 'name avatarUrl');

  res.status(200).json(formatStory(updatedStory));
};

// --- ВИДАЛИТИ ІСТОРІЮ ---
export const deleteStory = async (req, res) => {
  const { id } = req.params;
  const story = await Story.findById(id);

  if (!story) throw createHttpError(404, 'Story not found');
  if (story.ownerId.toString() !== req.user._id.toString()) {
    throw createHttpError(403, 'You are not allowed to delete this story');
  }

  await story.deleteOne();
  res.status(204).send();
};
