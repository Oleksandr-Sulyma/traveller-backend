// import { Joi, Segments } from 'celebrate';

// const objectIdSchema = Joi.string().hex().length(24);

// const paginationSchema = {
//   page: Joi.number().integer().min(1).default(1),
//   perPage: Joi.number().integer().min(1).max(100).default(12),
// };

// export const getAllUsersSchema = {
//   [Segments.QUERY]: Joi.object({
//     ...paginationSchema,
//     sortBy: Joi.string()
//       .valid('name', 'email', 'createdAt', 'articlesAmount')
//       .default('createdAt'),
//     sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
//     search: Joi.string().allow('').max(50),
//   }),
// };

// export const getUserStoriesSchema = {
//   [Segments.PARAMS]: Joi.object({
//     id: objectIdSchema.required().messages({
//       'any.required': 'ID користувача є обов’язковим',
//       'string.length': 'Невірний формат ID',
//     }),
//   }),
//   [Segments.QUERY]: Joi.object({
//     ...paginationSchema,
//     sortBy: Joi.string()
//       .valid('createdAt', 'title', 'favoriteCount')
//       .default('createdAt'),
//     sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
//   }),
// };


// export const updateUserSchema = {
//   [Segments.BODY]: Joi.object({
//     name: Joi.string().max(32).required().messages({
//       'string.max': 'Ім’я не може бути довшим за 32 символи',
//       'any.required': 'Ім’я є обов’язковим',
//     }),
//     email: Joi.string().email().max(64).required().messages({
//       'string.email': 'Введіть коректний email',
//       'string.max': 'Email не може бути довшим за 64 символи',
//       'any.required': 'Email є обов’язковим',
//     }),
//     description: Joi.string().max(150).required().trim().messages({
//       'string.max': 'Опис не може бути довшим за 150 символів',
//       'any.required': 'Опис є обов’язковим',
//     }),
//     avatar: Joi.any().required().messages({
//       'any.required': 'Аватар є обов’язковим',
//     }),
//   }),
// };

// export const changePasswordSchema = {
//   [Segments.BODY]: Joi.object({
//     oldPassword: Joi.string().required(),
//     newPassword: Joi.string().min(8).max(128).required().messages({
//       'string.min': 'Пароль має бути не менше 8 символів',
//       'string.max': 'Пароль занадто довгий',
//     }),
//   }),
// };


import { Joi, Segments } from 'celebrate';

const objectIdSchema = Joi.string().hex().length(24);

const paginationSchema = {
  page: Joi.number().integer().min(1).default(1),
  perPage: Joi.number().integer().min(1).max(100).default(12),
};

export const getAllUsersSchema = {
  [Segments.QUERY]: Joi.object({
    ...paginationSchema,
    sortBy: Joi.string()
      .valid('name', 'email', 'createdAt', 'articlesAmount')
      .default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().allow('').max(50),
  }),
};

export const getUserStoriesSchema = {
  [Segments.PARAMS]: Joi.object({
    id: objectIdSchema.required().messages({
      'any.required': 'ID користувача є обов’язковим',
      'string.length': 'Невірний формат ID',
    }),
  }),
};

export const updateUserSchema = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().max(32).messages({
      'string.max': 'Ім’я не може бути довшим за 32 символи',
    }),
    description: Joi.string().max(150).trim().messages({
      'string.max': 'Опис не може бути довшим за 150 символів',
    }),
  }).min(1).messages({
    'object.min': 'Надішліть хоча б одне поле для оновлення',
  }),
};

export const changePasswordSchema = {
  [Segments.BODY]: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128).required().messages({
      'string.min': 'Пароль має бути не менше 8 символів',
      'string.max': 'Пароль занадто довгий',
    }),
  }),
};