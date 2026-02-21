import { Joi, Segments } from "celebrate";

const paginationSchema = {
  page: Joi.number().integer().min(1).default(1),
  perPage: Joi.number().integer().min(1).max(50).default(10),
};

 export const createStorySchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().max(80).required(),
    article: Joi.string().max(2500).required(),
    category: Joi.string().required(),
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

 export const updateStorySchema = {
  [Segments.PARAMS]: Joi.object({
    storyId: Joi.string().hex().length(24).required(),
  }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().max(80),
    article: Joi.string().max(2500),
    category: Joi.string(),
 }), 
 };  
    
export const getStoryByIdSchema = {
  [Segments.PARAMS]: Joi.object({
    storyId: Joi.string().hex().length(24).required(),
  }),
};

export const getAllStoriesSchema = {
  [Segments.QUERY]: Joi.object({
    ...paginationSchema,
    category: Joi.string().hex().length(24).optional(),
  }),
};
