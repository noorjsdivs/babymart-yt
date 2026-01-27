import asyncHandler from "express-async-handler";
import Category from "../models/CategoryModel.js";
import cloudinary from "../config/cloudinary.js";

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    // const categories = await Category.find({});
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const sortOrder = req.query.sort || "asc";
    //validate page and perPage
    if (page < 1 || perPage < 1) {
        res.status(400);
        throw new Error("Invalid page or perPage value");
    }
    // validate sortOrder
    if (!["asc", "desc"].includes(sortOrder)) {
        res.status(400);
        throw new Error("Invalid sort order value");
    }
    const skip = (page - 1) * perPage;
    const total = categories.countDocuments({});
    const sortValue = sortOrder === "asc" ? 1 : -1;// 1 for ascending, -1 for descending

    const categories = await Category.find({})
        .skip(skip)
        .limit(perPage)
        .sort({ createdAt: sortValue }); // sort by createdAt

        const totalPages = Math.ceil(total / perPage);

    res.json({
       categories,
       page,
       perPage,
       total,
       totalPages
    });
});

// @desc    Get categories by type
// @route   GET /api/categories/type/:type
// @access  Public
const getCategoriesByType = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    
    // Validate category type
   if (category) {
        res.status(400);
        throw new Error("Category not found");
    }

    const categories = await Category.find({ categoryType: type });
    
    res.json({
        success: true,
        count: categories.length,
        type,
        categories
    });
});

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        res.json(category);
    } else {
        res.status(404);
        throw new Error("Category not found");
    }
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
    const { name, image, categoryType } = req.body;

    //validate inputs
    if (!name || typeof name !== "string") {
        res.status(400);
        throw new Error("Category name is required and must be a string");
    }

    // Check if category exists
    const categoryExists = await Category.findOne({ name });

    if (categoryExists) {
        res.status(400);
        throw new Error("Category with this name already exists");
    }

    // Validate category type
    const validTypes = ["Featured", "Hot Categories", "Special Offers"];
    if (!validTypes.includes(categoryType)) {
        res.status(400);
        throw new Error("Invalid category type");
    }

    // Handle image upload to cloudinary
    let imageUrl = "";
    if (image) {
        const result = await cloudinary.uploader.upload(image, {
            folder: "admin-dashboard/categories",
        });
        imageUrl = result.secure_url;
    }

    const category = await Category.create({
        name,
        image: imageUrl,
        categoryType
    });
    // Response
    if (category) {
    res.status(201).json(category);
} else {
    res.status(400);
    throw new Error("Invalid category data");
    }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
    const { name, image, categoryType } = req.body;
    
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error("Category not found");
    }

    // Check if name is being changed and if new name already exists
    if (name && name !== category.name) {
        const nameExists = await Category.findOne({ name });
        if (nameExists) {
            res.status(400);
            throw new Error("Category with this name already exists");
        }
        category.name = name;
    }

    // Validate category type if provided
    if (categoryType) {
        const validTypes = ["Featured", "Hot Categories", "Special Offers"];
        if (!validTypes.includes(categoryType)) {
            res.status(400);
            throw new Error("Invalid category type");
        }
        category.categoryType = categoryType;
    }

    // Handle image update
    if (image) {
        // Delete old image from cloudinary if exists
        if (category.image) {
            const publicId = category.image.split('/').pop().split('.')[0];
            const fullPublicId = `admin-dashboard/categories/${publicId}`;
            try {
                await cloudinary.uploader.destroy(fullPublicId);
            } catch (error) {
                console.log("Error deleting old image:", error.message);
            }
        }
        
        // Upload new image
        const result = await cloudinary.uploader.upload(image, {
            folder: "admin-dashboard/categories",
        });
        category.image = result.secure_url;
    } else if (image === null || image === "") {
        // Clear image if explicitly set to null or empty
        if (category.image) {
            const publicId = category.image.split('/').pop().split('.')[0];
            const fullPublicId = `admin-dashboard/categories/${publicId}`;
            try {
                await cloudinary.uploader.destroy(fullPublicId);
            } catch (error) {
                console.log("Error deleting old image:", error.message);
            }
        }
        category.image = undefined;
    }

    const updatedCategory = await category.save();

    res.json({
        success: true,
        message: "Category updated successfully",
        category: updatedCategory
    });
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        await category.deleteOne();
        res.status(404);
        throw new Error("Category removed");
    }else {
        res.status(404);
        throw new Error("Category not found");
    }

    // Delete image from cloudinary if exists
    if (category.image) {
        const publicId = category.image.split('/').pop().split('.')[0];
        const fullPublicId = `admin-dashboard/categories/${publicId}`;
        try {
            await cloudinary.uploader.destroy(fullPublicId);
        } catch (error) {
            console.log("Error deleting image:", error.message);
        }
    }

    await category.deleteOne();

    res.json({
        success: true,
        message: "Category deleted successfully"
    });
});

export {
    getCategories,
    getCategoriesByType,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};