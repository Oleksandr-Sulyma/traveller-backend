import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import { sendEmail } from "../utils/sendMail.js";

export const registerUser = async (req, res) => {
  const { email, password, name } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createHttpError(400, "Email in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const newSession = await createSession(newUser._id);

  setSessionCookies(res, newSession);

  res.status(201).json(newUser);
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(401, "Invalid credentials");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw createHttpError(401, "Invalid credentials");
  }

  await Session.deleteMany({ userId: user._id });

  const newSession = await createSession(user._id);

  setSessionCookies(res, newSession);

  res.status(200).json({
    user,
  });
};

export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600 * 1000;
    await user.save();

    const message = `
      Hello ${user.name},
      You requested a password reset.
      Click the link below to reset your password:
      ${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}
    `;

    await sendEmail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Password Reset Request",
      text: message,
    });

    res.status(200).json({
      status: 200,
      message: "Password reset email sent successfully",
    });
  } catch (err) {
    next(createHttpError(500, err.message));
  }
};
