import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import cloudinary from "../config/cloudinary.js";

// @desc    Get all products with pagination, sorting, and filtering
// @route   GET /api/products?page=<page>&limit=<limit>&sortOrder=<asc|desc>&category=<categoryId>&priceMin=<min>&priceMax=<max>
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortOrder = "asc",
    category,
    brand,
    priceMin,
    priceMax,
    search,
  } = req.query;

  // console.log("query", req.query);

  // Validate page and limit
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  if (pageNumber < 1 || limitNumber < 1) {
    res.status(400);
    throw new Error("Page and limit must be positive integers");
  }

  // Validate sortOrder
  if (!["asc", "desc"].includes(sortOrder)) {
    res.status(400);
    throw new Error('Sort order must be "asc" or "desc"');
  }

  // Build query
  const query = {};
  if (category) query.category = category;
  if (brand) query.brand = brand;
  if (priceMin || priceMax) {
    query.price = {};
    if (priceMin) query.price.$gte = Number(priceMin);
    if (priceMax) {
      query.price.$lte =
        Number(priceMax) === Infinity
          ? Number.MAX_SAFE_INTEGER
          : Number(priceMax);
    }
  }

  if (search) {
    query.name = { $regex: search, $options: "i" }; // Case-insensitive search
  }

  // Pagination
  const skip = (pageNumber - 1) * limitNumber;

  // Fetch products and total count
  const sortValue = sortOrder === "asc" ? 1 : -1;
  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name")
      .populate("brand", "name")
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: sortValue }),
    Product.countDocuments(query),
  ]);

  res.json({
    products,
    total,
  });
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name")
    .populate("brand", "name");

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
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

  // Check if product with same name exists
  const productExists = await Product.findOne({ name });
  if (productExists) {
    res.status(400);
    throw new Error("Product with this name already exists");
  }

  // Upload image to Cloudinary
  const result = await cloudinary.uploader.upload(image, {
    folder: "admin-dashboard/products",
  });

  const product = await Product.create({
    name,
    description,
    price,
    category,
    brand,
    discountPercentage: discountPercentage || 0,
    stock: stock || 0,
    image: result.secure_url,
  });

  if (product) {
    res.status(201).json(product);
  } else {
    res.status(400);
    throw new Error("Invalid product data");
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
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

  const product = await Product.findById(req.params.id);

  if (product) {
    // Check if new name is already taken by another product
    if (name !== product.name) {
      const productExists = await Product.findOne({ name });
      if (productExists) {
        res.status(400);
        throw new Error("Product with this name already exists");
      }
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.discountPercentage =
      discountPercentage || product.discountPercentage;
    product.stock = stock || product.stock;

    // Update image if provided
    if (image && image !== product.image) {
      const result = await cloudinary.uploader.upload(image, {
        folder: "admin-dashboard/products",
      });
      product.image = result.secure_url;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Rate a product
// @route   POST /api/products/:id/rate
// @access  Private
const rateProduct = asyncHandler(async (req, res) => {
  const { rating } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyRated = product.ratings.find(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    if (alreadyRated) {
      // Update existing rating
      alreadyRated.rating = rating;
    } else {
      // Add new rating
      product.ratings.push({
        userId: req.user._id,
        rating,
      });
    }

    await product.save();
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  rateProduct,
  deleteProduct,
};
