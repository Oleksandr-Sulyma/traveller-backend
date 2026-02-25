import { Category } from "../models/category.js";

export const getAllCategories = async (req, res) => {
  const categories = await Category.find();
  res.status(200).json(categories.map(category => ({
    id: category._id,
    name: category.name,
  })));
};
