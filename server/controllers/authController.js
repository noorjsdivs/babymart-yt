import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

//register user controller
const registerUser = asyncHandler(async (req, res) => { 
    const { name, email, password, role } = req.body ;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists, Try login instead");
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role,
        addresses: [],
    });

    // 
   if (user){
    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        addresses: user.addresses,
    });
   }else
    res.status(400);
    throw new Error ("Invalid user data");
});

// login user

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = await req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            addresses: user.addresses,
            token:generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }  
    });

    //getUserProfile
    const getUserProfile = asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);
        if (user) {
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                addresses: user.addresses || [],
            });
        } else {
            console.log("User not found with ID:", req.user._id);
            res.status(404);
            throw new Error("User not found"
            );
        }
    });

    //logout user
    const logoutUser = asyncHandler(async (req, res) => {
        res.status(200).json({ 
            success: true,
            message: "Logging out user" 
        });
    });
export { registerUser, loginUser, getUserProfile, logoutUser };