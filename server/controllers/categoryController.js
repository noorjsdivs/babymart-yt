import asyncHandler from "express-async-handler";
import Category from "../models/categoryModel.js";
import cloudinary from "../config/cloudinary.js";

const getCategories = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 20;
  const sortOrder = req.query.sortOrder || "asc";

  if (page < 1 || perPage < 1) {
    res.status(400);
    throw new Error("Page and perPage must be positive integers");
  }
  if (!["asc", "desc"].includes(sortOrder)) {
    res.status(400);
    throw new Error("Sort order must be either asc or desc");
  }
  const skip = (page - 1) * perPage;
  const total = await Category.countDocuments({});
  const sortValue = sortOrder === "asc" ? 1 : -1;
  const categories = await Category.find({})
    .skip(skip)
    .limit(perPage)
    .sort({ createdAt: sortValue });

  const totalPages = Math.ceil(total / perPage);
  res.json({ categories, total, totalPages, page, perPage });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, image, categoryTpe } = req.body;

  if (!name || typeof name !== "string") {
    res.status(400);
    throw new Error("Category name is required and must be a string");
  }
  const validCategoryTypes = ["Featured", "Hot Categories", "Top Categories"];
  if (!validCategoryTypes.includes(categoryTpe)) {
    res.status(400);
    throw new Error("Invalid category type");
  }
  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error("Category already exists");
  }
  let imageUrl = "";
  if (image) {
    const result = await cloudinary.uploader.upload(image, {
      folder: "/admin-dashboard/categories",
    });
    imageUrl = result.secure_url;
  }
  const category = await Category.create({
    name,
    image: imageUrl || undefined,
    categoryTpe,
  });
  if (category) {
    res.status(201).json(category);
  } else {
    res.status(400);
    throw new Error("Invalid category data");
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  const { name, image, categoryTpe } = req.body;
  const validCategoryTypes = ["Featured", "Hot Categories", "Top Categories"];
  if (categoryTpe && !validCategoryTypes.includes(categoryTpe)) {
    res.status(400);
    throw new Error("Invalid category type");
  }
  const category = await Category.findById(req.params.id);
  if (category) {
    category.name = name || category.name;
    category.categoryTpe = categoryTpe || category.categoryTpe;
    if (image !== undefined) {
      if (image) {
        const result = await cloudinary.uploader.upload(image, {
          folder: "admin-dashboard/categories",
        });
        category.image = result.secure_url;
      } else {
        category.image = undefined;
      }
    }
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (category) {
    await category.deleteOne();
    res.json({ message: "Category removed" });
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});

export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
