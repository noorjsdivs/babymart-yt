import mongoose from "mongoose";

const bannerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    startFrom: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    bannerType: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
