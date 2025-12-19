import asyncHandler from "express-async-handler";
import Banner from "../models/bannerModel.js";
import cloudinary from "../config/cloudinary.js";

// @desc    Get all banners
// @route   GET /api/banners
// @access  Private
const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({});
  res.json(banners);
});

// @desc    Get banner by ID
// @route   GET /api/banners/:id
// @access  Private
const getBannerById = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (banner) {
    res.json(banner);
  } else {
    res.status(404);
    throw new Error("Banner not found");
  }
});

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private/Admin
const createBanner = asyncHandler(async (req, res) => {
  const { name, title, startFrom, image, bannerType } = req.body;

  // const bannerExists = await User.findOne({ name });
  // if (bannerExists) {
  //   res.status(400);
  //   throw new Error("Same banner already exists");
  // }

  let imageUrl = "";
  if (image) {
    const result = await cloudinary.uploader.upload(image, {
      folder: "admin-dashboard/banners",
    });
    imageUrl = result.secure_url;
  }

  const banner = new Banner({
    name,
    title,
    startFrom,
    image: imageUrl || undefined,
    bannerType,
  });

  const createdBanner = await banner.save();
  if (createBanner) {
    res.status(201).json(createdBanner);
  } else {
    res.status(400);
    throw new Error("Invalid banner data");
  }
});

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
const updateBanner = asyncHandler(async (req, res) => {
  const { name, title, startFrom, image, bannerType } = req.body;

  const banner = await Banner.findById(req.params.id);

  if (banner) {
    banner.name = name || banner.name;
    banner.title = title || banner.title;
    banner.startFrom = startFrom || banner.startFrom;
    banner.bannerType = bannerType || banner.bannerType;

    try {
      if (image !== undefined) {
        if (image) {
          const result = await cloudinary.uploader.upload(image, {
            folder: "admin-dashboard/banners",
          });
          brand.image = result.secure_url;
        } else {
          brand.image = undefined; // Clear image if empty string is provided
        }
      }
      const updatedBanner = await banner.save();
      res.json(updatedBanner);
    } catch (error) {
      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        res.status(400);
        throw new Error(errors.join(", "));
      }
      res.status(400);
      throw new Error("Invalid banner data");
    }
  } else {
    res.status(404);
    throw new Error("Banner not found");
  }
});

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (banner) {
    await banner.deleteOne();
    res.json({ message: "Banner removed" });
  } else {
    res.status(404);
    throw new Error("Banner not found");
  }
});

export { getBanners, getBannerById, createBanner, updateBanner, deleteBanner };
