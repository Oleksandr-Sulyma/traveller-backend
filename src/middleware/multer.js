import multer from 'multer';
import createHttpError from 'http-errors';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    return cb(createHttpError(400, 'Завантажувати можна лише зображення!'), false);
  }
  cb(null, true);
};


const createUploader = (sizeLimit) => multer({
  storage,
  limits: {
    fileSize: sizeLimit,
  },
  fileFilter,
});

export const uploadStoryImg = createUploader(2 * 1024 * 1024); // 2MB для історій
export const uploadAvatar = createUploader(500 * 1024);       // 500KB для аватарок
