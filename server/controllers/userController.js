import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.status(200).json({
        success: true,
        count: users.length,
        users,
    });
});

// @desc    Create a new user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }
    
    // Validate required fields
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill all required fields: name, email, password");
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'customer',
        addresses: [],
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            addresses: user.addresses,
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

// @desc    Get user by ID (Admin or user themselves)
// @route   GET /api/users/:id
// @access  Private
const getUsersById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
        // Check if user is requesting their own data or is admin
        if (req.user._id.toString() === user._id.toString() || req.user.role === 'admin') {
            res.json({
                success: true,
                user
            });
        } else {
            res.status(403);
            throw new Error('Not authorized to view this user');
        }
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

// @desc    Update user (Admin or user themselves)
// @route   PUT /api/users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    
    // Check authorization: user can update themselves, admin can update anyone
    if (req.user._id.toString() !== user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to update this user');
    }

    // Update fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    // Only admin can change role
    if (req.body.role && req.user.role === 'admin') {
        user.role = req.body.role;
    }
    
    // Update password if provided
    if (req.body.password) {
        user.password = req.body.password;
    }
    
    // Update addresses if provided
    if (req.body.addresses) {
        user.addresses = req.body.addresses;
    }

    const updatedUser = await user.save();
    
    res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        addresses: updatedUser.addresses,
    });
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    
    if (user) {
        // Check if admin is trying to delete themselves
        if (req.user._id.toString() === user._id.toString()) {
            res.status(400);
            throw new Error('Admins cannot delete themselves');
        }
        
        await user.deleteOne();
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

// @desc    Add address to user profile
// @route   POST /api/users/:id/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Only allow user to modify their own addresses or admin
    if (req.user._id.toString() !== user._id.toString() && req.user.role !== "admin") {
        res.status(403);
        throw new Error("Not authorized to modify this user's addresses");
    }

    const { street, city, country, postalCode, isDefault } = req.body;

    if (!street || !city || !country || !postalCode) {
        res.status(400);
        throw new Error("All address fields are required");
    }

    const newAddress = {
        street,
        city,
        country,
        postalCode,
        isDefault: isDefault || false,
    };

    // If this is set as default, make other addresses non-default
    if (newAddress.isDefault) {
        user.addresses.forEach((addr) => {
            addr.isDefault = false;
        });
    }
    
    // If this is the first address, set as default
    if (user.addresses.length === 0) {
        newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    res.json({
        success: true,
        addresses: user.addresses,
        message: "Address added successfully",
    });
});

// @desc    Update user address
// @route   PUT /api/users/:id/addresses/:addressId
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Only allow user to modify their own addresses or admin
    if (req.user._id.toString() !== user._id.toString() && req.user.role !== "admin") {
        res.status(403);
        throw new Error("Not authorized to modify this user's addresses");
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
        res.status(404);
        throw new Error("Address not found");
    }
    
    const { street, city, country, postalCode, isDefault } = req.body;

    if (street) address.street = street;
    if (city) address.city = city;
    if (country) address.country = country;
    if (postalCode) address.postalCode = postalCode;

    // If this is set as default, make other addresses non-default
    if (isDefault) {
        user.addresses.forEach((addr) => {
            addr.isDefault = false;
        });
        address.isDefault = true;
    }

    await user.save();

    res.json({
        success: true,
        addresses: user.addresses,
        message: "Address updated successfully",
    });
});

// @desc    Delete user address
// @route   DELETE /api/users/:id/addresses/:addressId
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Only allow user to modify their own addresses or admin
    if (req.user._id.toString() !== user._id.toString() && req.user.role !== "admin") {
        res.status(403);
        throw new Error("Not authorized to modify this user's addresses");
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
        res.status(404);
        throw new Error("Address not found");
    }

    // If deleting default address, make the first remaining address default
    const wasDefault = address.isDefault;
    user.addresses.pull(req.params.addressId);
    
    if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
    }
    
    await user.save();

    res.json({
        success: true,
        addresses: user.addresses,
        message: "Address deleted successfully",
    });
});

export { 
    getUsers, 
    createUser, 
    getUsersById, 
    updateUser, 
    deleteUser, 
    addAddress, 
    updateAddress, 
    deleteAddress 
};