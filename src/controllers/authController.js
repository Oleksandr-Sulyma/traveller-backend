import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import { refreshSessionLogic } from '../services/sessionService.js';
import { sendEmail } from '../utils/sendMail.js';

export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(createHttpError(409, 'Користувач з такою поштою вже зареєстрований'));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const newSession = await createSession(newUser._id);
  setSessionCookies(res, newSession);

  res.status(201).json({
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    avatarUrl: newUser.avatarUrl,
  });
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(createHttpError(401, 'Невірна пошта або пароль'));
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return next(createHttpError(401, 'Невірна пошта або пароль'));
  }

  await Session.deleteOne({ userId: user._id });
  const newSession = await createSession(user._id);
  setSessionCookies(res, newSession);

  res.status(200).json({
    id: user._id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
  });
};

export const refreshUserSession = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies;
    const newSession = await refreshSessionLogic(sessionId, refreshToken);
    setSessionCookies(res, newSession);
    res.status(200).json({ message: 'Сесію оновлено' });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;
  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }
  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(204).send();
};

export const requestResetEmail = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({ message: 'Лист для відновлення пароля надіслано' });
  }

  const resetToken = jwt.sign(
    { sub: user._id, email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const templatePath = path.resolve('src/templates/reset-password-email.html');
  const templateSource = await fs.readFile(templatePath, 'utf-8');
  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`,
  });

  try {
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Відновлення пароля',
      html,
    });
  } catch (error) {
    return next(createHttpError(500, 'Не вдалося надіслати лист'));
  }
  res.status(200).json({ message: 'Лист для відновлення пароля надіслано' });
};

export const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return next(createHttpError(401, 'Посилання недійсне або термін його дії закінчився'));
  }

  const user = await User.findOne({ _id: payload.sub, email: payload.email });
  if (!user) {
    return next(createHttpError(404, 'Користувача не знайдено'));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.updateOne({ _id: user._id }, { password: hashedPassword });
  await Session.deleteMany({ userId: user._id });

  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Пароль успішно змінено' });
};

export const checkSession = async (req, res) => {
  res.status(200).json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    avatarUrl: req.user.avatarUrl,
  });
};
