import { Joi, Segments } from 'celebrate';
import { paginationSchema } from './storyValidation.js';

export const getAllUsersSchema = {
  [Segments.QUERY]: Joi.object({
    ...paginationSchema,
  }),
};

export const getUserStoriesSchema = {
  [Segments.QUERY]: Joi.object({
    ...paginationSchema,
  }),
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
};

export const updateUserSchema = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().max(32),
    description: Joi.string().max(150),
 }),
 };
