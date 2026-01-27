import asyncHandler from "express-async-handler";
import Product from "../models/ProductModel.js";

// Create product controller
const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        price,
        category,  // Note: lowercase in request
        Category,  // Also check for uppercase in request
        brand,
        images,
        discountPercentage,
        stock,
    } = req.body;

    // Check if product with same name exists
    const productExists = await Product.findOne({ name });
    if (productExists) {
        res.status(400);
        throw new Error("Product with this name already exists");
    }

    // Use Category (uppercase) if provided, otherwise use category (lowercase)
    // This handles cases where the request might send either format
    const categoryField = Category || category;

    // Validate required fields
    if (!name || !description || !price || !categoryField || !brand) {
        res.status(400);
        throw new Error("Please fill all required fields: name, description, price, category, brand");
    }

    // Create product
    const product = await Product.create({
        name,
        description,
        price,
        Category: categoryField,  // Map to uppercase Category for schema
        brand,
        discountPercentage: discountPercentage || 0,
        stock: stock || 0,
        image: images || "",  // Changed from "image" to match your variable name
    });

    if (product) {
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });
    } else {
        res.status(400);
        throw new Error("Invalid product data");
    }
});

export { createProduct };