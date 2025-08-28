import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import cloudinary from "../config/cloudinary.js";
// getUsers
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.status(200).json({
    success: true,
    users,
  });
});

// createUser
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, addresses } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    addresses: addresses || [],
  });
  if (user) {
    // Initialize empty cart
    // await Cart.create({ userId: user._id, items: [] });

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

// getUserById
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// updateUser
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  // Allow updates by the user themselves or admins
  user.name = req.body.name || user.name;
  if (req.body.password) {
    user.password = req.body.password;
  }
  if (req.body.role) {
    user.role = req.body.role;
  }
  user.addresses = req.body.addresses || user.addresses;

  //   avatar
  if (req.body.avatar && req.body.avatar !== user.avatar) {
    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.body.avatar, {
      folder: "babymartyt/avatars",
    });
    user.avatar = result.secure_url;
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

// deleteUser

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Delete user's cart
    // Delete user's orders (if any exist)
    // Delete the user
    await user.deleteOne();
    res.status(200).json({
      status: "success",
      message: "User deleted successfully!",
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// addAddress
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Only allow user to modify their own addresses or admin
  if (
    user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to modify this user's addresses");
  }

  const { street, city, country, postalCode, isDefault } = req.body;

  if (!street || !city || !country || !postalCode) {
    res.status(400);
    throw new Error("All address fields are required");
  }

  // If this is set as default, make other addresses non-default
  if (isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  // If this is the first address, make it default
  if (user.addresses.length === 0) {
    user.addresses.push({
      street,
      city,
      country,
      postalCode,
      isDefault: true,
    });
  } else {
    user.addresses.push({
      street,
      city,
      country,
      postalCode,
      isDefault: isDefault || false,
    });
  }

  await user.save();

  res.json({
    success: true,
    addresses: user.addresses,
    message: "Address added successfully",
  });
});

// updateAddress
const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Only allow user to modify their own addresses or admin
  if (
    user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
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

// deleteAddress
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Only allow user to modify their own addresses or admin
  if (
    user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
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
  getUserById,
  updateUser,
  deleteUser,
  addAddress,
  updateAddress,
  deleteAddress,
};
