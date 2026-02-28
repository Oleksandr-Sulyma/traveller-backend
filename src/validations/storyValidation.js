import { Joi, Segments } from 'celebrate';
import { Category } from '../models/category.js';

// Спільна схема для валідації MongoDB ID
const objectIdSchema = Joi.string().hex().length(24);

export const paginationSchema = {
  page: Joi.number().integer().min(1).default(1),
  perPage: Joi.number().integer().min(1).max(50).default(10),
};

// Валідація для отримання всіх історій (фільтрація)

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

// Валідація для створення історії
export const createStorySchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(3).max(80).required().trim(),
    article: Joi.string().min(10).max(2500).required().trim(),
    category: objectIdSchema.required().messages({
      'any.required': 'Category ID is required',
      'string.length': 'Invalid Category ID format',
    }),
  }),
};

// Валідація для отримання за ID

export const getStoryByIdSchema = {
  [Segments.PARAMS]: Joi.object({
    id: objectIdSchema.required(),
  }),
};

// Валідація для оновлення історії

export const updateStorySchema = {
  [Segments.PARAMS]: Joi.object({
    id: objectIdSchema.required(),
  }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(3).max(80).trim(),
    article: Joi.string().min(10).max(2500).trim(),
    category: objectIdSchema,
  }).min(1),
};

// Валідація для власних та збережених історій

export const getMyStoriesSchema = {
  [Segments.QUERY]: Joi.object({
    ...paginationSchema,
  }),
};

export const getSavedStoriesSchema = {
  [Segments.QUERY]: Joi.object({
    ...paginationSchema,
  }),
};
