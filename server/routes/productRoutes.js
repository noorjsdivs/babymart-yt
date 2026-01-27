import express from "express";
import { admin, protect } from "../middleware/authMiddleware.js";
import { createProduct } from "../controllers/productController.js";

const router = express.Router();

//getProducts
router.route("/").post(protect,admin,createProduct);

export default router;