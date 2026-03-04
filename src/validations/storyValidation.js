import { Joi, Segments } from 'celebrate';

const objectIdSchema = Joi.string().hex().length(24);

const paginationSchema = {
  page: Joi.number().integer().min(1).default(1),
  perPage: Joi.number().integer().min(1).max(100).default(10),
};

export const getAllStoriesSchema = {
  [Segments.QUERY]: Joi.object({
    ...paginationSchema,
    category: objectIdSchema,
    author: objectIdSchema,
    favorite: Joi.string().valid('true', 'false'),
    sortBy: Joi.string().valid('createdAt', 'title', 'favoriteCount').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

export const getStoryByIdSchema = {
  [Segments.PARAMS]: Joi.object({
    id: objectIdSchema.required().messages({
      'any.required': 'ID історії є обов’язковим',
      'string.length': 'Невірний формат ID історії',
    }),
  }),
};

export const getMyStoriesSchema = {
  [Segments.QUERY]: Joi.object({
    ...paginationSchema,
  }),
};

export const createStorySchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().max(80).required().trim().messages({
      'string.max': 'Заголовок не може бути довшим за 80 символів',
      'any.required': 'Заголовок є обов’язковим',
    }),
    article: Joi.string().max(2500).required().trim().messages({
      'string.max': 'Текст історії не може бути довшим за 2500 символів',
      'any.required': 'Текст історії є обов’язковим',
    }),
    category: objectIdSchema.required().messages({
      'any.required': 'Категорія є обов’язковою',
      'string.length': 'Невірний формат ID категорії',
    }),
    img: Joi.any().required().messages({
      'any.required': 'Фото історії є обов’язковим',
    }),
  }),
};

export const updateStorySchema = {
  [Segments.PARAMS]: Joi.object({
    id: objectIdSchema.required(),
  }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().max(80).trim(),
    article: Joi.string().max(2500).trim(),
    category: objectIdSchema,
    img: Joi.any(),
  }).min(1).messages({
    'object.min': 'Надішліть хоча б одне поле для оновлення',
  }),
};
