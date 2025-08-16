import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getUserWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("wishlist");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({
    success: true,
    wishlist: user.wishlist || [],
  });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist/add
// @access  Private
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if product is already in wishlist
  if (user.wishlist.includes(productId)) {
    res.status(400);
    throw new Error("Product already in wishlist");
  }

  // Add product to wishlist
  user.wishlist.push(productId);
  await user.save();

  res.json({
    success: true,
    wishlist: user.wishlist,
    message: "Product added to wishlist",
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/remove
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Remove product from wishlist
  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== productId.toString()
  );
  await user.save();

  res.json({
    success: true,
    wishlist: user.wishlist,
    message: "Product removed from wishlist",
  });
});

// @desc    Get wishlist products with details
// @route   POST /api/wishlist/products
// @access  Private
export const getWishlistProducts = asyncHandler(async (req, res) => {
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds)) {
    res.status(400);
    throw new Error("Product IDs array is required");
  }

  // Get products by IDs
  const products = await Product.find({
    _id: { $in: productIds },
  }).populate("category", "name");

  res.json({
    success: true,
    products,
  });
});

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
export const clearWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Clear wishlist
  user.wishlist = [];
  await user.save();

  res.json({
    success: true,
    wishlist: [],
    message: "Wishlist cleared successfully",
  });
});
