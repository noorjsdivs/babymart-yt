import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true 
    },
    password: {
        type: String,
        required: true
    },
    avartar: {
        type: String,
        default: "default-avatar.png"
    },
    role: {
        type: String,
        enum: ["admin", "user", "deliveryman" ],
        default: "user"
    }, 
    addresses: [{
        street: {
            type: String,
            required: true,
        },
        city: { 
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        postalCode: {
            type: String,
            required: true,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
],
    //whishlist
    whishlist:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            
        },
    ],
    //cart
    cart:[
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
        }
    ],
    //oder
},
{ 
    timestamps: true,
 }
); 

//match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {   
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
 userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    // Encrypt password using bcrypt
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
}); 

// Ensure only one address is default
userSchema.pre("save", function (next) {
    const defaultAddresses = this.addresses.filter(addr => addr.
        isDefault);
    if (defaultAddresses) {
        this.addresses.forEach((addr) => {
           if (addr !== defaultAddresses) addr.isDefault = false;
        });
    }
    next();
});

const User = mongoose.model("User", userSchema);

export default User;