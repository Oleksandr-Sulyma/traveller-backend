import { Session } from '../models/session.js';
import createHttpError from 'http-errors';
import { createSession } from './authServices.js';

export const refreshSessionLogic = async (sessionId, refreshToken) => {
  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) throw createHttpError(401, "Session not found");

  if (new Date() > new Date(session.refreshTokenValidUntil)) {
    throw createHttpError(401, "Session expired");
  }

  await Session.deleteOne({ _id: sessionId });

  return createSession(session.userId);
};
