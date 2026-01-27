import express from "express";

import {
    getUserWishlist,
    addToWishlist,
    removeFromeWishlist,
    getWishlistProducts,
    clearWishlist,
} from "../controllers/whishlistController.js";


import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user's wishlist
router.route("/").get(protect, getUserWishlist);

//Add product to wishlist
router.route("/add").post(protect, addToWishlist);

//Remove product from wishlist
router.route("/remove").delete(protect, removeFromeWishlist);

//get wishlist products with details
router.route("/products").post(protect, getWishlistProducts);

//clear entire wishlist