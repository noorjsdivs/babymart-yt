import Category from "../model/category.model.js";
import asyncHandler from "express-async-handler";
import cloudinary from "../config/cloudinary.js";

/**
 * @desc Get all categories
 * @route GET /api/categories
 * @access Private
 */
export const getCategories = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.limit) || 10;
  const sortOrder = req.query.sortOrder || "asc";

  // validate page and per page
  if (page < 1 || perPage < 1) {
    res.status(400).json({
      success: false,
      message: "Page and perPage must be greater than 0",
    });
  }

  // validate sortOrder
  if (!["asc", "desc"].includes(sortOrder)) {
    res.status(400).json({
      success: false,
      message: "sortOrder must be asc or desc",
    });
  }

  const skip = (page - 1) * perPage;
  const total = await Category.countDocuments({});
  const sortValue = sortOrder === "asc" ? 1 : -1;

  const categories = await Category.find({})
    .skip(skip)
    .limit(perPage)
    .sort({ createdAt: sortValue });

  const totalPages = Math.ceil(total / perPage);

  res.status(200).json({
    success: true,
    categories,
    page,
    perPage,
    total,
    totalPages,
  });
});

/**
 * @desc Create category
 * @route POST /api/categories
 * @access Private
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, image, categoryType } = req.body;

  // Validate inputs
  if (!name || typeof name !== "string") {
    res.status(400).json({
      success: false,
      message: "Name is required and must be a string",
    });
    return;
  }

  // Validate categoryType
  const validCategoryTypes = ["Featured", "Hot Categories", "Top Categories"];
  if (!validCategoryTypes.includes(categoryType)) {
    res.status(400).json({
      success: false,
      message:
        "Category type must be Featured, Hot Categories or Top Categories",
    });
    return;
  }

  const categoryExists = await Category.findOne({ name });

  if (categoryExists) {
    res.status(400).json({
      success: false,
      message: "Category already exists",
    });
    return;
  }

  let imageUrl = "";
  if (image) {
    const result = await cloudinary.uploader.upload(image, {
      folder: "admin-dashboard/categories",
    });

    imageUrl = result.secure_url;
  }

  const category = await Category.create({
    name,
    image: imageUrl || undefined,
    categoryType,
  });

  if (category) {
    res.status(201).json({
      success: true,
      category,
    });
  } else {
    res.status(400);
    throw new Error("Invalid category data");
  }
});

/**
 * @desc Get category by id
 * @route GET /api/categories/:id
 * @access Private
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.status(200).json({
    success: true,
    category,
  });
});

/**
 * @desc Update category
 * @route PUT /api/categories/:id
 * @access Private
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, image, categoryType } = req.body;

  // Validate categoryType
  const validCategoryTypes = ["Featured", "Hot Categories", "Top Categories"];
  if (categoryType && !validCategoryTypes.includes(categoryType)) {
    res.status(400).json({
      success: false,
      message:
        "Category type must be Featured, Hot Categories or Top Categories",
    });
    return;
  }

  const category = await Category.findById(req.params.id);
  if (category) {
    category.name = name || category.name;
    category.categoryType = categoryType || category.categoryType;

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
    res.status(200).json({
      success: true,
      category: updatedCategory,
    });
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});

/**
 * @desc Delete category
 * @route DELETE /api/categories/:id
 * @access Private
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    await category.deleteOne();
    res.json({ message: "Category removed" });
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});
