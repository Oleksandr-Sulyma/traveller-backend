import multer from 'multer';
import createHttpError from 'http-errors';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    return cb(createHttpError(400, 'Завантажувати можна лише зображення!'), false);
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
},
  fileFilter,
});

//використання в проекті:
// 1. Оновлення аватара (поле avatar)
// JavaScript
// // routes/userRouter.js
// userRouter.patch(
//   '/avatar',
//   authenticate,
//   upload.single('avatar'), // Очікуємо файл у полі 'avatar'
//   userController.updateAvatar
// );
// 2. Створення історії (поле img)
// JavaScript
// // routes/storiesRouter.js
// storiesRouter.post(
//   '/',
//   authenticate,
//   upload.single('img'), // Очікуємо файл у полі 'img' (згідно з вашим JSON)
//   validateBody(storySchema),
//   storiesController.createStory
// );
