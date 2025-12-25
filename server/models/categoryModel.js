import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        image: {
            type: String,
            required: false,
        },
        categoryType:{
            type: String,
            required: true,
            enum: ["Featured", "Hot Categories", "Top Categories", "home"]
        }
    },
    { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;