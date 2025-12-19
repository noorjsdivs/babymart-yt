import asyncHandler from "express-async-handler";
import User from "../model/user.model.js";

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.status(200).json({
    success: true,
    users,
  });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({
      message: "User already exists",
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    adddresses: [],
  });

  if (user) {
    // Initialize empty cart
    // await Cart.create({ user: user._id, items: [] });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      addresses: user.addresses || [],
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export const updateUser = asyncHandler(async (req, res) => {
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

  // avatar
  const updateUser = await user.save();

  res.status(200).json({
    _id: updateUser._id,
    name: updateUser.name,
    email: updateUser.email,
    avatar: updateUser.avatar,
    role: updateUser.role,
    addresses: updateUser.addresses || [],
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Delete user's cart
    // Delete user's orders (if any)
    // Delete the user
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted",
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404).json({
      message: "User not found",
    });
  }

  // Only allow user to modify their own address or admin
  if (
    user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403).json({
      message: "Not authorized to add address",
    });
  }

  const { street, city, country, postalCode, isDefault } = req.body;

  if (!street || !city || !country || !postalCode) {
    res.status(400).json({
      message: "All fields are required",
    });
  }

  // If this is set as default, make other address non-default
  if (isDefault) {
    user.addresses.forEach((address) => {
      address.isDefault = false;
    });
  }

  // if this is the first address, make it default
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

  res.status(200).json({
    success: true,
    message: "Address added successfully",
    addresses: user.addresses,
  });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404).json({
      message: "User not found",
    });
  }

  // Only allow user to modify their own address or admin
  if (
    user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403).json({
      message: "Not authorized to update address",
    });
  }

  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    res.status(404).json({
      message: "Address not found",
    });
  }

  const { street, city, country, postalCode, isDefault } = req.body;

  if (street) address.street = street;
  if (city) address.city = city;
  if (country) address.country = country;
  if (postalCode) address.postalCode = postalCode;
  if (isDefault) address.isDefault = isDefault;

  // If this is set as default, make other address non-default
  if (isDefault) {
    user.addresses.forEach((address) => {
      address.isDefault = false;
    });
    address.isDefault = true;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Address updated successfully",
    addresses: user.addresses,
  });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404).json({
      message: "User not found",
    });
  }

  // Only allow user to modify their own address or admin
  if (
    user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403).json({
      message: "Not authorized to delete address",
    });
  }

  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    res.status(404).json({
      message: "Address not found",
    });
  }

  // If deleting default address, make the first remaining address default
  const wasDefault = address.isDefault;
  user.addresses.pull(req.params.addressId);

  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Address deleted successfully",
    addresses: user.addresses,
  });
});
