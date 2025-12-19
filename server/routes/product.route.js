import express from "express";
import { admin, protect } from "../middleware/authMiddleware.js";
import { createProduct } from "../controllers/product.controller.js";

const productRouter = express.Router();

// create product
productRouter.route("/").post(protect, admin, createProduct);

export default productRouter;
