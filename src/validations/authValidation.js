import { Joi, Segments } from 'celebrate';

export const registerUserSchema = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(2).max(32).required().trim().messages({
      'string.min': 'Ім’я має містити не менше 2 символів',
      'string.max': 'Ім’я не може бути довшим за 32 символи',
      'any.required': 'Ім’я є обов’язковим',
    }),
    email: Joi.string().email().max(64).lowercase().trim().required().messages({
      'string.email': 'Некоректний формат електронної пошти',
      'string.max': 'Email не може бути довшим за 64 символи',
      'any.required': 'Email є обов’язковим',
    }),
    password: Joi.string().min(8).max(128).required().messages({
      'string.min': 'Пароль має бути не менше 8 символів',
      'string.max': 'Пароль занадто довгий (макс. 128)',
      'any.required': 'Пароль є обов’язковим',
    }),
  }),
};

export const loginUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().max(64).lowercase().trim().required().messages({
      'string.email': 'Некоректний формат електронної пошти',
      'any.required': 'Email є обов’язковим',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Пароль є обов’язковим',
    }),
  }),
};

export const requestResetEmailSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().max(64).required().trim().lowercase().messages({
      'string.email': 'Некоректний формат електронної пошти',
      'any.required': 'Email є обов’язковим',
    }),
  }),
};

export const resetPasswordSchema = {
  [Segments.BODY]: Joi.object({
    password: Joi.string().min(8).max(128).required().messages({
      'string.min': 'Новий пароль має бути не менше 8 символів',
      'string.max': 'Пароль занадто довгий',
      'any.required': 'Пароль є обов’язковим',
    }),
    token: Joi.string().required().messages({
      'any.required': 'Токен відновлення обов’язковий',
    }),
  }),
};
