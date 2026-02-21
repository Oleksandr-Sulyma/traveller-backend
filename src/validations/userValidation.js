import { Joi, Segments } from "celebrate";

export const getAllUsersSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(1).max(50).default(10),
  }),
};

export const updateUserSchema = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().max(32),
    description: Joi.string().max(150),
 }),
 };
