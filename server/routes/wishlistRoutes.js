import express from "express";
import {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  getWishlistProducts,
  clearWishlist,
} from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user's wishlist
router.route("/").get(protect, getUserWishlist);

// Add product to wishlist
router.route("/add").post(protect, addToWishlist);

// Remove product from wishlist
router.route("/remove").delete(protect, removeFromWishlist);

// Get wishlist products with details
router.route("/products").post(protect, getWishlistProducts);

// Clear entire wishlist
router.route("/clear").delete(protect, clearWishlist);

export default router;
