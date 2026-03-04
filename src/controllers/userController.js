import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { uploadFileOrThrowError } from '../utils/uploadFileOrThrowError.js';

export const getAllUsers = async (req, res) => {
  const { page = 1, perPage = 10, search } = req.query;
  const pageNum = Number(page);
  const perPageNum = Number(perPage);
  const skip = (pageNum - 1) * perPageNum;

  let filter = {};
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .skip(skip)
      .limit(perPageNum)
      .sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    users,
    totalPages: Math.ceil(total / perPageNum),
  });
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    throw createHttpError(404, '@Користувача не знайдено');
  }

  res.status(200).json(user);
};

export const getCurrentUser = async (req, res) => {
  if (!req.user) {
    throw createHttpError(401, '@Користувач не авторизований');
  }
  res.status(200).json(req.user);
};

export const updateUserAvatar = async (req, res) => {
  if (!req.file) {
    throw createHttpError(400, 'Будь ласка, виберіть файл для завантаження');
  }

  const uploadedImgUrl = await uploadFileOrThrowError(req.file.buffer);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatarUrl: uploadedImgUrl },
    { new: true }
  );

  if (!user) {
    throw createHttpError(404, '@Користувача не знайдено');
  }

  res.status(200).json(user);
};

export const updateUserInfo = async (req, res) => {
  const { name, description } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      ...(name ? { name: name.trim() } : {}),
      ...(description ? { description: description.trim() } : {}),
    },
    { new: true },
  );

  if (!user) {
    throw createHttpError(404, '@Користувача не знайдено');
  }

  res.status(200).json(user);
};
