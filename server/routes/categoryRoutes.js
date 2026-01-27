import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByType
} from "../controllers/categoryController.js";

const router = express.Router();

// Public routes
router.route("/")
    .get(getCategories); // GET /api/categories

router.route("/:id")
    .get(getCategoryById); // GET /api/categories/:id

router.route("/type/:type")
    .get(getCategoriesByType); // GET /api/categories/type/:type

// Admin protected routes
router.route("/")
    .post(protect, admin, createCategory); // POST /api/categories

router.route("/:id")
    .put(protect, admin, updateCategory) // PUT /api/categories/:id
    .delete(protect, admin, deleteCategory); // DELETE /api/categories/:id

export default router;