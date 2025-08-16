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
      required: false, // Image is optional
    },
    categoryType: {
      type: String,
      required: true,
      enum: ["Featured", "Hot Categories", "Top Categories"], // Mandatory with specific values
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
