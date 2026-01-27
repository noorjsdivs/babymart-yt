import Wishlist from "../models/wishlistModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getUserWishlist = async (req, res) => {
    const user = await User.findById(req.user._id).select("whishlist");
     if (!user){
        res.status(404);
        throw new Error("User not found");
     }
    try {
        const userId = req.user._id;
        
        const wishlist = await Wishlist.findOne({ user: userId }).populate('items.product', 'name price image stock');

        if (!wishlist) {
            return res.status(404).json({
                success: true,
                message: "No wishlist found",
                data: { items: [] }
            });
        }

        res.status(200).json({
            success: true,
            data: wishlist
        });

    } catch (error) {
        console.error("Get wishlist error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/add
// @access  Private
export const addToWishlist = async (req, res) => {
    const { productId } = req.body;

    // Validate that productId is provided
    if (!productId) {
        return res.status(400).json({
            success: false,
            message: "Product ID is required"
        });
    }

    try {
        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const userId = req.user._id;

        // Find or create wishlist for user
        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: userId,
                items: []
            });
        }

        // Check if product already exists in wishlist
        const existingItem = wishlist.items.find(item => 
            item.product.toString() === productId
        );

        if (existingItem) {
            return res.status(400).json({
                success: false,
                message: "Product already in wishlist"
            });
        }

        // Add product to wishlist
        wishlist.items.push({
            product: productId,
            addedAt: new Date()
        });

        await wishlist.save();

        // Populate product details
        await wishlist.populate('items.product', 'name price image stock category');

        res.status(200).json({
            success: true,
            message: "Product added to wishlist successfully",
            data: wishlist
        });

    } catch (error) {
        console.error("Add to wishlist error:", error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/remove
// @access  Private
export const removeFromWishlist = async (req, res) => {
    const { productId } = req.body;

    // Validate that productId is provided
    if (!productId) {
        return res.status(400).json({
            success: false,
            message: "Product ID is required"
        });
    }

    try {
        const userId = req.user._id;

        // Find user's wishlist
        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found"
            });
        }

        // Check if product exists in wishlist
        const itemIndex = wishlist.items.findIndex(item => 
            item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist"
            });
        }

        // Remove product from wishlist
        wishlist.items.splice(itemIndex, 1);
        await wishlist.save();

        // Populate remaining products
        await wishlist.populate('items.product', 'name price image stock');

        res.status(200).json({
            success: true,
            message: "Product removed from wishlist successfully",
            data: wishlist
        });

    } catch (error) {
        console.error("Remove from wishlist error:", error);
        
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

// @desc    Get wishlist products with details
// @route   POST /api/wishlist/products
// @access  Private
export const getWishlistProducts = async (req, res) => {
    const { page = 1, limit = 20, sortBy = 'addedAt', sortOrder = 'desc' } = req.body;

    try {
        const userId = req.user._id;

        // Find wishlist with populated products
        const wishlist = await Wishlist.findOne({ user: userId })
            .populate({
                path: 'items.product',
                select: 'name price image stock category brand discount rating numReviews',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'brand', select: 'name' }
                ]
            });

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                pagination: {
                    totalItems: 0,
                    totalPages: 0,
                    currentPage: 1,
                    itemsPerPage: limit,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            });
        }

        // Create a copy of items for sorting
        let items = [...wishlist.items];

        // Sort items
        items.sort((a, b) => {
            if (sortBy === 'addedAt') {
                const dateA = new Date(a.addedAt);
                const dateB = new Date(b.addedAt);
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            }
            
            if (sortBy === 'name') {
                const nameA = a.product?.name || '';
                const nameB = b.product?.name || '';
                return sortOrder === 'desc' 
                    ? nameB.localeCompare(nameA)
                    : nameA.localeCompare(nameB);
            }
            
            if (sortBy === 'price') {
                const priceA = a.product?.price || 0;
                const priceB = b.product?.price || 0;
                return sortOrder === 'desc' ? priceB - priceA : priceA - priceB;
            }
            
            return 0;
        });

        // Filter out items with deleted products
        items = items.filter(item => item.product);

        // Pagination logic
        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / limit);
        const currentPage = Math.max(1, Math.min(page, totalPages));
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedItems = items.slice(startIndex, endIndex);

        // Transform data for frontend
        const transformedItems = paginatedItems.map(item => {
            const product = item.product;
            const originalPrice = product.price || 0;
            const discount = product.discount || 0;
            const discountedPrice = discount > 0 
                ? originalPrice * (1 - discount / 100) 
                : originalPrice;

            return {
                _id: item._id,
                product: {
                    _id: product._id,
                    name: product.name || 'Unknown Product',
                    price: originalPrice,
                    discountedPrice: discountedPrice,
                    discount: discount,
                    image: product.image || '/images/default-product.png',
                    stock: product.stock || 0,
                    category: product.category?.name || 'Uncategorized',
                    brand: product.brand?.name || 'No Brand',
                    rating: product.rating || 0,
                    numReviews: product.numReviews || 0,
                    isOutOfStock: (product.stock || 0) <= 0
                },
                addedAt: item.addedAt
            };
        });

        res.status(200).json({
            success: true,
            count: totalItems,
            data: transformedItems,
            pagination: {
                totalItems,
                totalPages,
                currentPage,
                itemsPerPage: parseInt(limit),
                hasNextPage: endIndex < totalItems,
                hasPrevPage: startIndex > 0,
                nextPage: endIndex < totalItems ? currentPage + 1 : null,
                prevPage: startIndex > 0 ? currentPage - 1 : null
            }
        });

    } catch (error) {
        console.error("Get wishlist products error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
export const clearWishlist = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find user's wishlist
        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found"
            });
        }

        // Check if wishlist is already empty
        if (wishlist.items.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Wishlist is already empty",
                data: wishlist
            });
        }

        // Clear all items
        wishlist.items = [];
        await wishlist.save();

        res.status(200).json({
            success: true,
            message: "Wishlist cleared successfully",
            data: wishlist
        });

    } catch (error) {
        console.error("Clear wishlist error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

export default {
    getUserWishlist,
    addToWishlist,
    removeFromWishlist,
    getWishlistProducts,
    clearWishlist
};