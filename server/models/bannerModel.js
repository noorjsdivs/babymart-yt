import mongoose from "mongoose";

const bannerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    startForm : {
        type: Date,
        required: true,
    },
    image: {
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