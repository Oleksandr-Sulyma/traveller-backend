import createHttpError from 'http-errors';
import { Session } from '../models/session.js';
import { User } from '../models/user.js';

export const authenticate = async (req, res, next) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    throw createHttpError(401, 'Missing access token');
  }

  const session = await Session.findOne({ accessToken }).populate('userId');

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  if (new Date() > session.accessTokenValidUntil) {
    throw createHttpError(401, 'Access token expired');
  }

  if (!session.userId) {
    throw createHttpError(401, 'User associated with session not found');
  }

  req.user = session.userId;
  req.session = session;

  next();
};
