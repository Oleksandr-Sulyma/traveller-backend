import createHttpError from 'http-errors';
import { Session } from '../models/session.js';

export const authenticate = async (req, res, next) => {
  try {
    const { accessToken, sessionId } = req.cookies;

    if (!accessToken || !sessionId) {
      return next(createHttpError(401, 'Будь ласка, увійдіть у свій акаунт'));
    }

    const session = await Session.findOne({ _id: sessionId, accessToken }).populate('userId');

    if (!session) {
      return next(createHttpError(401, 'Будь ласка, увійдіть у свій акаунт'));
    }

    if (new Date() > new Date(session.accessTokenValidUntil)) {
      return next(createHttpError(401, 'Термін дії сесії закінчився'));
    }

    // Пе
    if (!session.userId) {
      return next(createHttpError(401, 'Користувача не знайдено'));
    }

    req.user = session.userId;
    req.session = session;

    next();
  } catch (error) {
    next(error);
  }
};
