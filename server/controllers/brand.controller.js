import cloudinary from "../config/cloudinary.js";
import Brand from "../model/brand.model.js";
import asyncHandler from "express-async-handler";

/**
 * @desc Get all brands
 * @route GET /api/brands
 * @access Private
 */
export const getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({});
  res.status(200).json({
    success: true,
    brands,
  });
});

/**
 * @desc Get brand by id
 * @route GET /api/brands/:id
 * @access Private
 */
export const getBrandById = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  res.status(200).json({
    success: true,
    brand,
  });
});

/**
 * @desc Create brand
 * @route POST /api/brands
 * @access Private
 */
export const createBrand = asyncHandler(async (req, res) => {
  const { name, image } = req.body;

  const brandExists = await Brand.findOne({ name });

  if (brandExists) {
    res.status(400);
    throw new Error("Brand already exists");
  }

  let imageUrl = "";
  if (image) {
    try {
      const result = await cloudinary.uploader.upload(image, {
        folder: "admin-dashboard/brands",
      });

      imageUrl = result.secure_url;
    } catch (error) {
      res.status(500);
      throw new Error("Image upload failed");
    }
  }

  const brand = await Brand.create({
    name,
    image: imageUrl || undefined,
  });

  res.status(201).json({
    success: true,
    brand,
  });
});

/**
 * @desc Update brand
 * @route PUT /api/brands/:id
 * @access Private
 */
export const updateBrand = asyncHandler(async (req, res) => {
  const { name, image } = req.body;

  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    res.status(404);
    throw new Error("Brand not found");
  }

  if (brand) {
    brand.name = name || brand.name;

    if (image !== undefined) {
      if (image) {
        const result = await cloudinary.uploader.upload(image, {
          folder: "admin-dashboard/brands",
        });

        brand.image = result.secure_url;
      } else {
        brand.image = undefined;
      }
    }

    const updatedBrand = await brand.save();
    res.json(updatedBrand);
  } else {
    res.status(404);
    throw new Error("Brand not found");
  }
});

/**
 * @desc Delete brand
 * @route DELETE /api/brands/:id
 * @access Private
 */
export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (brand) {
    await brand.deleteOne();
    res.json({ message: "Brand removed" });
  } else {
    res.status(404);
    throw new Error("Brand not found");
  }
});
