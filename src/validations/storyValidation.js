import { Joi, Segments } from "celebrate";

export const createStorySchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().max(80).required(),
    article: Joi.string().max(2500).required(),
    img: Joi.string().required(),
    category: Joi.string().required(),
  }),
};

export const getMyStoriesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(1).max(50).default(10),
  }),
};

export const getSavedStoriesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(1).max(50).default(10),
  }),
};