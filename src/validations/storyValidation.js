import { Joi, Segments } from 'celebrate';
import { Category } from '../models/category.js';

export const paginationSchema = {
  page: Joi.number().integer().min(1).default(1),
  perPage: Joi.number().integer().min(1).max(50).default(10),
};

const validateCategory = async (value, helpers) => {
  const categoryExists = await Category.findById(value);
  if (!categoryExists) {
    return helpers.error('any.custom', { message: 'Category not found' });
  }
  return value;
};

export const createStorySchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().max(80).required(),
    article: Joi.string().max(2500).required(),
    category: Joi.string().hex().length(24).required().external(validateCategory),
  }),
};

export const updateStorySchema = {
  [Segments.PARAMS]: Joi.object({
    storyId: Joi.string().hex().length(24).required(),
  }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().max(80),
    article: Joi.string().max(2500),
    category: Joi.string().hex().length(24).external(validateCategory),
  }),
};

export const getStoryByIdSchema = {
  [Segments.PARAMS]: Joi.object({
    storyId: Joi.string().hex().length(24).required(),
  }),
};

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

export const getAllStoriesSchema = {
  [Segments.QUERY]: Joi.object({
    ...paginationSchema,
    category: Joi.string().hex().length(24).optional(),
  }),
};
