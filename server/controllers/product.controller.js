import asyncHandler from "express-async-handler";
import Product from "../model/product.model.js";
import cloudinary from "../config/cloudinary.js";

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    category,
    brand,
    image,
    discountPercentage,
    stock,
  } = req.body;

  // CHECK IF PRODUCT WITH SAME NAME EXISTS
  const productExists = await Product.findOne({ name });

  if (productExists) {
    res.status(400).json({
      message: "Product already exists",
    });
  }

  // UPLOAD IMAGE TO CLOUDINARY
  const product = await Product.create({
    name,
    description,
    price,
    category,
    brand,
    image: "",
    discountPercentage: discountPercentage || 0,
    stock: stock || 0,
  });

  if (product) {
    res.status(201).json(product);
  } else {
    res.status(400).json({
      message: "Product not created",
    });
  }
});
