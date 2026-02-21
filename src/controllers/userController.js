import createHttpError from "http-errors";
import { User } from "../models/user.js";
import { uploadFileOrThrowError } from '../utils/uploadFileOrThrowError.js';

// - getAllUsers (ПУБЛІЧНИЙ)

export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, perPage = 10 } = req.query;

    const pageNum = Number(page);
    const perPageNum = Number(perPage);
    const skip = (pageNum - 1) * perPageNum;

    const users = await User.find({})
      .select("_id name email avatarUrl description articlesAmount createdAt")
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
  } catch (err) {
    next(err);
  }
};
// - getUserById (ПУБЛІЧНИЙ)
// - getCurrentUser (ПРИВАТНИЙ)

export const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(createHttpError(401, "Unauthorized"));
    }

    res.status(200).json({ user: req.user });
  } catch (err) {
    next(err);
  }
};
// - updateUserAvatar (ПРИВАТНИЙ)
// - updateUserInfo (ПРИВАТНИЙ)
export const updateUserAvatar = async (req, res) => {
  if (!req.file) {
    throw createHttpError(400, 'No file');
  }

 const uploadedImgUrl = await uploadFileOrThrowError(req.file.buffer)

  try {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatarUrl: uploadedImgUrl },
    { new: true },
  );

  res.status(200).json( { avatarUrl: user.avatarUrl } );
} catch (error) {
  console.error('Error updating avatar:', error);
createHttpError(500, 'Failed to update avatar');
}
};



export const updateUserInfo = async (req, res) => {
  const { name, description } = req.body || {};
    try {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      ...(name ? { name: name.trim() } : {}),
      ...(description ? { description: description.trim() } : {}),
     },
    { new: true },
  );

  res.status(200).json( { name: user.name, avatarUrl: user.avatarUrl, description: user.description, id: user._id  } );
} catch (error) {
  console.error('Error updating profile:', error);
createHttpError(500, 'Failed to update profile');
}
};
