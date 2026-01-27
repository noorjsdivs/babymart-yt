import mongoose from "mongoose";

const cartItemSchema = mongoose.Schema({
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required: true,     
    },
    quantity:{
        type: Number,
        required: true,
        min : 1,
    },
    image :{
        type: String,  
    },
});

const cartSchema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    items: [cartItemSchema],
},
{
    timestamps: true,
}
);


const cart = mongoose.model("Cart",cartSchema);

export default cart;