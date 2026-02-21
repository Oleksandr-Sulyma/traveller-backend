
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";
import createHttpError from "http-errors";

export const uploadFileOrThrowError = async (buffer) => {

  if (!buffer) {return null;}
    try {
      const uploadedImg = await saveFileToCloudinary(buffer);
      if (!uploadedImg || !uploadedImg.secure_url) {
        throw createHttpError(500, "Failed to upload image");
      }
      return uploadedImg.secure_url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw createHttpError(500, "Failed to upload image");
    }
}
