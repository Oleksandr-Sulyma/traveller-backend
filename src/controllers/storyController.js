import createHttpError from 'http-errors';
import { Story } from '../models/story.js';
import { User } from '../models/user.js';
import { Category } from '../models/category.js';
import { uploadFileOrThrowError } from '../utils/uploadFileOrThrowError.js';

export const getAllStories = async (req, res) => {
  const {
    page = 1,
    perPage = 10,
    category,
    author,
    favorite,
    sortBy = 'favoriteCount',
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
    if (!user?.savedStories?.length) {
      return res.status(200).json({ stories: [], totalPages: 0 });
    }
    filter._id = { $in: user.savedStories };
  }

  let activeSortField = sortBy;
  if (sortBy === 'createdAt') {
    activeSortField = '_id';
  }

  try {
    const [total, stories] = await Promise.all([
      Story.countDocuments(filter),
      Story.find(filter)
        .skip(skip)
        .limit(limitNum)
        .sort({ [activeSortField]: sortOrder === 'asc' ? 1 : -1 })
        .populate('category', 'name')
        .populate('ownerId', 'name avatarUrl'),
    ]);

    res.status(200).json({
      stories,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Database Sort Error:", error);
    res.status(500).json({ message: "Помилка при отриманні історій" });
  }
};

export const getStoryById = async (req, res) => {
  const { id } = req.params;
  const story = await Story.findById(id)
    .populate('category', 'name')
    .populate('ownerId', 'name avatarUrl');

  if (!story) throw createHttpError(404, '@Історію не знайдено');

  res.status(200).json(story);
};

export const getOwnStories = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(Math.max(1, Number(perPage)), 100);
  const skip = (pageNum - 1) * limitNum;

  const [total, stories] = await Promise.all([
    Story.countDocuments({ ownerId: req.user._id }),
    Story.find({ ownerId: req.user._id })
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 })
      .populate('category', 'name')
      .populate('ownerId', 'name avatarUrl'),
  ]);

  res.status(200).json({
    stories,
    totalPages: Math.ceil(total / limitNum),
  });
};

export const getSavedStories = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(Math.max(1, Number(perPage)), 100);
  const skip = (pageNum - 1) * limitNum;

  const user = await User.findById(req.user._id);
  const savedIds = user?.savedStories || [];

  const stories = await Story.find({ _id: { $in: savedIds } })
    .populate('category', 'name')
    .populate('ownerId', 'name avatarUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    stories,
    totalPages: Math.ceil(savedIds.length / limitNum),
  });
};

export const addToSave = async (req, res) => {
  const { id } = req.params;

  const story = await Story.findById(id);
  if (!story) throw createHttpError(404, '@Історію не знайдено');

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { savedStories: id } },
    { new: true }
  ).populate('savedStories');

  await Story.findByIdAndUpdate(id, { $inc: { favoriteCount: 1 } });

  res.status(200).json(updatedUser.savedStories);
};

export const removeFromSave = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(req.user._id);
  const wasSaved = user?.savedStories.includes(id);

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { savedStories: id } },
    { new: true }
  ).populate('savedStories');

  if (wasSaved) {
    await Story.findByIdAndUpdate(id, { $inc: { favoriteCount: -1 } });
  }

  res.status(200).json(updatedUser.savedStories);
};

export const createStory = async (req, res) => {
  const { title, article, category } = req.body;
  if (!req.file) throw createHttpError(400, 'Ви не завантажили фото');

  const categoryEntity = await Category.findById(category);
  if (!categoryEntity) throw createHttpError(400, 'Невірна категорія');

  const imgUrl = await uploadFileOrThrowError(req.file.buffer);

  const newStory = await Story.create({
    title,
    article,
    category: categoryEntity._id,
    img: imgUrl,
    ownerId: req.user._id,
  });

  await User.findByIdAndUpdate(req.user._id, {
    $inc: { articlesAmount: 1 },
  });

  const populatedStory = await Story.findById(newStory._id)
    .populate('category', 'name')
    .populate('ownerId', 'name avatarUrl');

  res.status(201).json(populatedStory);
};

export const updateStory = async (req, res) => {
  const { id } = req.params;
  const { title, article, category } = req.body;

  const story = await Story.findById(id);
  if (!story) throw createHttpError(404, '@Історію не знайдено');
  if (story.ownerId.toString() !== req.user._id.toString()) {
    throw createHttpError(403, 'Ви не є власником цієї історії');
  }

  if (category) {
    const categoryEntity = await Category.findById(category);
    if (!categoryEntity) throw createHttpError(400, 'Невірна категорія');
    story.category = categoryEntity._id;
  }

  if (title) story.title = title.trim();
  if (article) story.article = article.trim();
  if (req.file) {
    story.img = await uploadFileOrThrowError(req.file.buffer);
  }

  await story.save();

  const updatedStory = await Story.findById(id)
    .populate('category', 'name')
    .populate('ownerId', 'name avatarUrl');

  res.status(200).json(updatedStory);
};

export const deleteStory = async (req, res) => {
  const { id } = req.params;
  const story = await Story.findOneAndDelete({ _id: id, ownerId: req.user._id });

  if (!story) {
    throw createHttpError(404, '@Історію не знайдено');
  }

  if (story.ownerId.toString() !== req.user._id.toString()) {
    throw createHttpError(403, 'Ви не є власником цієї історії');
  }

  await User.findByIdAndUpdate(req.user._id, {
    $inc: { articlesAmount: -1 },
  });

  res.status(204).send();
};
