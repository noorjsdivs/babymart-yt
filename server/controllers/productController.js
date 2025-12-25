import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import cloudinary from "../config/cloudinary.js";

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    discountPercentage,
    stock,
    image,
    category,
    brand,
  } = req.body;
  const productExists = await Product.findOne({ name });
  if (productExists) {
    res.status(400);
    throw new Error("Product with this name already exists");
  }
  const product = await Product.create({
    name,
    description,
    price,
    discountPercentage: discountPercentage || 0,
    stock: stock || 0,
    image: "",
    category,
    brand,
  });
  if (product) {
    res.status(201).json(product);
  } else {
    res.status(400);
    throw new Error("Invalid product data");
  }
});

export { createProduct };
