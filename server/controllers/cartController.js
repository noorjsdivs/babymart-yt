import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "cart.productId",
    model: "Product",
  });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Filter out any cart items with null/deleted products
  const validCartItems = user.cart.filter((item) => item.productId);

  res.json({
    success: true,
    cart: validCartItems,
    message: "Cart retrieved successfully",
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addItemToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  if (quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
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

  // Check if item already exists in cart
  const existingItemIndex = user.cart.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (existingItemIndex > -1) {
    // Update quantity if item exists
    user.cart[existingItemIndex].quantity += parseInt(quantity);
  } else {
    // Add new item to cart
    user.cart.push({
      productId,
      quantity: parseInt(quantity),
    });
  }

  await user.save();

  // Populate the cart for response
  await user.populate({
    path: "cart.productId",
    model: "Product",
  });

  // Filter out any cart items with null/deleted products
  const validCartItems = user.cart.filter((item) => item.productId);

  res.json({
    success: true,
    cart: validCartItems,
    message: "Item added to cart successfully",
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  if (quantity < 0) {
    res.status(400);
    throw new Error("Quantity cannot be negative");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const itemIndex = user.cart.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex > -1) {
    if (quantity === 0) {
      // Remove item if quantity is 0
      user.cart.splice(itemIndex, 1);
    } else {
      // Update quantity
      user.cart[itemIndex].quantity = parseInt(quantity);
    }
    await user.save();

    // Populate the cart for response
    await user.populate({
      path: "cart.productId",
      model: "Product",
    });

    // Filter out any cart items with null/deleted products
    const validCartItems = user.cart.filter((item) => item.productId);

    res.json({
      success: true,
      cart: validCartItems,
      message: "Cart item updated successfully",
    });
  } else {
    res.status(404);
    throw new Error("Item not found in cart");
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeItemFromCart = asyncHandler(async (req, res) => {
  const productId = req.params.productId;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const itemIndex = user.cart.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex > -1) {
    user.cart.splice(itemIndex, 1);
    await user.save();

    // Populate the cart for response
    await user.populate({
      path: "cart.productId",
      model: "Product",
    });

    // Filter out any cart items with null/deleted products
    const validCartItems = user.cart.filter((item) => item.productId);

    res.json({
      success: true,
      cart: validCartItems,
      message: "Item removed from cart successfully",
    });
  } else {
    res.status(404);
    throw new Error("Item not found in cart");
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.cart = [];
  await user.save();

  res.json({
    success: true,
    cart: [],
    message: "Cart cleared successfully",
  });
});
