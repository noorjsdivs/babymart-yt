// cartController.js
import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate({
            path: "items.product",
            select: "name price images stockCount",
            model: "Product"
        });

        if (!cart) {
            // Create an empty cart if one doesn't exist
            cart = await Cart.create({
                user: req.user._id,
                items: [],
                totalPrice: 0
            });
        }

        // Calculate total price if not already calculated
        if (cart.items.length > 0) {
            cart.totalPrice = cart.items.reduce((total, item) => {
                if (item.product && item.product.price) {
                    return total + (item.product.price * item.quantity);
                }
                return total;
            }, 0);
            
            await cart.save();
        }

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addItemToCart = asyncHandler(async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({
                success: false,
                message: "Product ID and quantity are required"
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than 0"
            });
        }

        // Check if product exists and is available
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.stockCount < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stockCount} items available in stock`
            });
        }

        // Find user's cart
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            // Create new cart if it doesn't exist
            cart = await Cart.create({
                user: req.user._id,
                items: [{ product: productId, quantity }],
                totalPrice: product.price * quantity
            });
        } else {
            // Check if product already exists in cart
            const existingItemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (existingItemIndex > -1) {
                // Update quantity if product already in cart
                const newQuantity = cart.items[existingItemIndex].quantity + quantity;
                
                if (newQuantity > product.stockCount) {
                    return res.status(400).json({
                        success: false,
                        message: `Cannot add more items. Total would exceed available stock of ${product.stockCount}`
                    });
                }
                
                cart.items[existingItemIndex].quantity = newQuantity;
            } else {
                // Add new item to cart
                cart.items.push({ product: productId, quantity });
            }

            // Recalculate total price
            await cart.populate({
                path: "items.product",
                select: "price",
                model: "Product"
            });

            cart.totalPrice = cart.items.reduce((total, item) => {
                if (item.product && item.product.price) {
                    return total + (item.product.price * item.quantity);
                }
                return total;
            }, 0);

            await cart.save();
        }

        // Populate product details for response
        await cart.populate({
            path: "items.product",
            select: "name price images",
            model: "Product"
        });

        res.status(200).json({
            success: true,
            message: "Item added to cart successfully",
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: "Product ID and quantity are required"
            });
        }

        if (quantity < 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity cannot be negative"
            });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Find user's cart
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // Find item in cart
        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }

        if (quantity === 0) {
            // Remove item if quantity is 0
            cart.items.splice(itemIndex, 1);
        } else {
            // Check stock availability
            if (quantity > product.stockCount) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stockCount} items available in stock`
                });
            }
            
            // Update quantity
            cart.items[itemIndex].quantity = quantity;
        }

        // Recalculate total price
        await cart.populate({
            path: "items.product",
            select: "price",
            model: "Product"
        });

        cart.totalPrice = cart.items.reduce((total, item) => {
            if (item.product && item.product.price) {
                return total + (item.product.price * item.quantity);
            }
            return total;
        }, 0);

        await cart.save();

        // Populate product details for response
        await cart.populate({
            path: "items.product",
            select: "name price images",
            model: "Product"
        });

        res.status(200).json({
            success: true,
            message: quantity === 0 ? "Item removed from cart" : "Cart updated successfully",
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeItemFromCart = asyncHandler(async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        // Find user's cart
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // Find item index in cart
        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }

        // Remove item from cart
        cart.items.splice(itemIndex, 1);

        // Recalculate total price
        if (cart.items.length > 0) {
            await cart.populate({
                path: "items.product",
                select: "price",
                model: "Product"
            });

            cart.totalPrice = cart.items.reduce((total, item) => {
                if (item.product && item.product.price) {
                    return total + (item.product.price * item.quantity);
                }
                return total;
            }, 0);
        } else {
            cart.totalPrice = 0;
        }

        await cart.save();

        // Populate remaining items for response
        await cart.populate({
            path: "items.product",
            select: "name price images",
            model: "Product"
        });

        res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // Clear all items
        cart.items = [];
        cart.totalPrice = 0;

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export {
    getCart,
    addItemToCart,
    updateCartItem,
    removeItemFromCart,
    clearCart
};