import { Category } from "../models/category.js";
import createHttpError from "http-errors";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(
      categories.map((category) => ({
        id: category._id,
        name: category.name,
      }))
    );
  } catch (error) {
    throw createHttpError(500, "Failed to fetch categories");
  }
};



