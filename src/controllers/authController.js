import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

import { refreshSessionLogic } from '../services/sessionService.js';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import { sendEmail } from '../utils/sendMail.js';

export const registerUser = async (req, res) => {
  const { email, password, name } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createHttpError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const newSession = await createSession(newUser._id);
  setSessionCookies(res, newSession);

  const { password: _, ...userResponse } = newUser.toObject();
  res.status(201).json(userResponse);
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw createHttpError(401, 'Invalid credentials');
  }

  await Session.deleteOne({ userId: user._id });

  const newSession = await createSession(user._id);
  setSessionCookies(res, newSession);

  const { password: _, ...userResponse } = user.toObject();
  res.status(200).json(userResponse);
};

export const refreshUserSession = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;

  if (!sessionId || !refreshToken) {
    throw createHttpError(401, 'Missing session data');
  }

  const newSession = await refreshSessionLogic(sessionId, refreshToken);
  setSessionCookies(res, newSession);

  res.status(200).json({ message: 'Session refreshed' });
};

export const requestResetEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({ message: 'Password reset email sent' });
  }

  const resetToken = jwt.sign(
    { sub: user._id, email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' },
  );

  const templatePath = path.resolve('src/templates/reset-password-email.html');
  const templateSource = await fs.readFile(templatePath, 'utf-8');
  const template = handlebars.compile(templateSource);

  const html = template({
    name: user.name || 'User',
    link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`,
  });

  try {
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch (error) {
    throw createHttpError(500, 'Failed to send email');
  }

  res.status(200).json({ message: 'Password reset email sent' });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(401, 'Invalid or expired token');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.findOneAndUpdate(
    { _id: payload.sub, email: payload.email },
    { password: hashedPassword },
  );

  if (!user) throw createHttpError(404, 'User not found');

  await Session.deleteMany({ userId: user._id });

  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).json({ message: 'Password reset successfully' });
};

export const checkSession = async (req, res) => {
  if (req.user) {
    return res.status(200).json(req.user);
  }
};

export const logoutUser = async (req, res) => {
  const sessionId = req.session?._id || req.cookies.sessionId;

  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }

  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(204).send();
};
