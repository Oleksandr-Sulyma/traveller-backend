import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { Story } from '../models/story.js';
import { uploadFileOrThrowError } from '../utils/uploadFileOrThrowError.js';
import mongoose from 'mongoose';

export const getAllUsers = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;
  const pageNum = Number(page);
  const perPageNum = Number(perPage);
  const skip = (pageNum - 1) * perPageNum;

  const users = await User.find({})
    .select('_id name email avatarUrl description articlesAmount createdAt')
    .skip(skip)
    .limit(perPageNum)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments();

  res.status(200).json({
    users: users || [],
    pagination: {
      page: pageNum,
      perPage: perPageNum,
      total,
      pages: Math.ceil(total / perPageNum),
    },
  });
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  const { page = 1, perPage = 10 } = req.query;
  const pageNum = Number(page);
  const perPageNum = Number(perPage);

  const user = await User.findById(id);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const storiesQuery = Story.find({ ownerId: id });
  const skip = (pageNum - 1) * perPageNum;

  const [totalStories, stories] = await Promise.all([
    storiesQuery.clone().countDocuments(),
    storiesQuery
      .clone()
      .skip(skip)
      .limit(perPageNum)
      .sort({ favoriteCount: -1, createdAt: -1 })
      .populate('category', 'name')
      .populate('ownerId', 'name'),
  ]);

  const totalPages = Math.ceil(totalStories / perPageNum);

  res.status(200).json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      description: user.description,
      articlesAmount: user.articlesAmount,
      createdAt: user.createdAt,
    },
    pageNum,
    perPageNum,
    totalStories,
    totalPages,
    stories,
  });
};

export const getCurrentUser = async (req, res) => {
  if (!req.user) {
    throw createHttpError(401, 'Unauthorized');
  }
  res.status(200).json({ user: req.user });
};

export const updateUserAvatar = async (req, res) => {
  if (!req.file) {
    throw createHttpError(400, 'No file provided');
  }

  const uploadedImgUrl = await uploadFileOrThrowError(req.file.buffer);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatarUrl: uploadedImgUrl },
    { new: true },
  );

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  res.status(200).json({ avatarUrl: user.avatarUrl });
};

export const updateUserInfo = async (req, res) => {
  const { name, description } = req.body || {};

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      ...(name ? { name: name.trim() } : {}),
      ...(description ? { description: description.trim() } : {}),
    },
    { new: true },
  );

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    description: user.description,
  });
};
