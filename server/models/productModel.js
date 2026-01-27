import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Product description is required"]
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        min: [0, "Price cannot be negative"]
    },
    Category: {  // Note: uppercase C
        type: String,
        required: [true, "Product category is required"]
    },
    brand: {
        type: String,
        required: [true, "Product brand is required"]
    },
    image: {
        type: String,
        default: ""
    },
    discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

const product = mongoose.model("Product", productSchema);

export default product;