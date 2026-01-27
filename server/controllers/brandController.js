import asyncHandler from "express-async-handler";
import Brand from "../models/BrandModel.js";
import cloudinary from "../config/cloudinary.js"; // Make sure to import cloudinary

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
    const brands = await Brand.find({});
    res.json(brands);
});

// @desc    Get brand by id
// @route   GET /api/brands/:id
// @access  Public
const getBrandById = asyncHandler(async (req, res) => {
    const brand = await Brand.findById(req.params.id);
    if (brand) {
        res.json(brand);
    } else {
        res.status(404);
        throw new Error("Brand not found");
    }
});

// @desc    Create a new brand
// @route   POST /api/brands
// @access  Private/Admin
const createBrand = asyncHandler(async (req, res) => {
    const { name, image } = req.body;

    const brandExists = await Brand.findOne({ name });
    
    if (brandExists) {
        res.status(400);
        throw new Error("Brand with this name already exists");
    }

    // Image upload to cloudinary
    let imageUrl = "";
    if (image) {
        const result = await cloudinary.uploader.upload(image, {
            folder: "admin-dashboard/brands",
        });
        imageUrl = result.secure_url;
    }

    const brand = await Brand.create({ 
        name, 
        image: imageUrl || undefined // store image URL if uploaded
    });

    if (brand) {
        res.status(201).json(brand);
    } else {
        res.status(400);
        throw new Error("Invalid brand data");
    }
});

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
const updateBrand = asyncHandler(async (req, res) => {
    const { name, image } = req.body;

    const brand = await Brand.findById(req.params.id);  

    if (brand) {
        brand.name = name || brand.name;

        if (image) {
            // Delete old image from cloudinary if exists
            if (brand.image) {
                const publicId = brand.image.split('/').pop().split('.')[0];
                const fullPublicId = `admin-dashboard/brands/${publicId}`;
                await cloudinary.uploader.destroy(fullPublicId);
            }
            
            // Upload new image
            const result = await cloudinary.uploader.upload(image, {
                folder: "admin-dashboard/brands",
            });
            brand.image = result.secure_url;
        } else if (image === null || image === "") {
            // Clear image if explicitly set to null or empty
            if (brand.image) {
                const publicId = brand.image.split('/').pop().split('.')[0];
                const fullPublicId = `admin-dashboard/brands/${publicId}`;
                await cloudinary.uploader.destroy(fullPublicId);
            }
            brand.image = undefined;
        }

        const updatedBrand = await brand.save();
        res.json(updatedBrand);
    } else {
        res.status(404);
        throw new Error("Brand not found");
    }
});

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
const deleteBrand = asyncHandler(async (req, res) => {
    const brand = await Brand.findById(req.params.id);  
    
    if (brand) {
        // Delete image from cloudinary if exists
        if (brand.image) {
            const publicId = brand.image.split('/').pop().split('.')[0];
            const fullPublicId = `admin-dashboard/brands/${publicId}`;
            await cloudinary.uploader.destroy(fullPublicId);
        }
        
        await brand.deleteOne();
        res.json({ message: "Brand removed" });
    } else {
        res.status(404);
        throw new Error("Brand not found");
    }
});

export {
    getBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand
};