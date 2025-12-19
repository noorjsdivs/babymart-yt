import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  createBrand,
  deleteBrand,
  getBrandById,
  getBrands,
  updateBrand,
} from "../controllers/brand.controller.js";

const brandRouter = express.Router();

brandRouter.route("/").get(getBrands).post(protect, admin, createBrand);

brandRouter
  .route("/:id")
  .get(getBrandById)
  .put(protect, admin, updateBrand)
  .delete(protect, admin, deleteBrand);

export default brandRouter;
