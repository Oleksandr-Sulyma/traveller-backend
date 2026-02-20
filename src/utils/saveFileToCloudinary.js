import { Readable } from 'node:stream';
import { v2 as cloudinary } from 'cloudinary';

// cloudinary.config({
//   secure: true,
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export async function saveFileToCloudinary(buffer) {
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
//         folder: 'notes-app/avatars',
//         resource_type: 'image',
//         overwrite: true,
//         unique_filename: true,
//         use_filename: false,
//       },
//       (err, result) => (err ? reject(err) : resolve(result)),
//     );

//     Readable.from(buffer).pipe(uploadStream);
//   });
// }

cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Універсальна функція для завантаження файлів у Cloudinary
 * @param {Buffer} buffer - буфер файлу (отриманий з multer.memoryStorage())
 * @param {String} folder - назва папки ('avatars' або 'story-covers')
 */
export async function saveFileToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `travellers-app/${folder}`,
        resource_type: 'auto',
        overwrite: true,
        unique_filename: true,
        use_filename: false,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}
