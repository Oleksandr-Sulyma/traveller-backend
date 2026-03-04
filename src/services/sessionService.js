import createHttpError from 'http-errors';
import { Session } from '../models/session.js';
import { createSession } from './auth.js';

export const refreshSessionLogic = async (sessionId, refreshToken) => {
  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Будь ласка, увійдіть у свій акаунт');
  }

  if (new Date() > new Date(session.refreshTokenValidUntil)) {
    throw createHttpError(401, 'Термін дії сесії закінчився, увійдіть знову');
  }

  await Session.deleteOne({ _id: sessionId });

  return createSession(session.userId);
};
