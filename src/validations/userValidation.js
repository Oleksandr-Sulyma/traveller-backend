import { Joi, Segments } from 'celebrate';

// Спільна схема для MongoDB ObjectId
const objectIdSchema = Joi.string().hex().length(24);

// Спільна схема для пагінації (можна імпортувати, якщо є окремо)
const paginationSchema = {
  page: Joi.number().integer().min(1).default(1),
  perPage: Joi.number().integer().min(1).max(100).default(10),
};

// Валідація для отримання списку всіх користувачів
export const getAllUsersSchema = {
  [Segments.QUERY]: Joi.object({
    ...paginationSchema,
    sortBy: Joi.string().valid('name', 'email', 'createdAt').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().allow('').max(50), // Пошук за ім'ям/email
  }),
};

// Валідація для отримання профілю конкретного юзера та його історій
export const getUserStoriesSchema = {
  [Segments.PARAMS]: Joi.object({
    id: objectIdSchema.required().messages({
      'string.length': 'User ID must be 24 characters long',
      'string.hex': 'User ID must be a valid hex string',
      'any.required': 'User ID is required',
    }),
  }),
  [Segments.QUERY]: Joi.object({
    ...paginationSchema,
    sortBy: Joi.string().valid('createdAt', 'title', 'favoriteCount').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};


//  Валідація для оновлення основної інформації профілю
export const updateUserSchema = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(2).max(32).trim().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 32 characters',
    }),
    description: Joi.string().max(150).trim().allow('').messages({
      'string.max': 'Description is too long (max 150 chars)',
    }),
  }).min(1),
};

// Валідація для зміни пароля
export const changePasswordSchema = {
  [Segments.BODY]: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(20).required(),
  }),
};
