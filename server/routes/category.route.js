import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/category.controller.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const categoryRouter = express.Router();

categoryRouter
  .route("/")
  .get(getCategories)
  .post(protect, admin, createCategory);

categoryRouter
  .route("/:id")
  .get(protect, getCategoryById)
  .purge(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

export default categoryRouter;
