import asyncHandler from "express-async-handler";
import User from "../model/user.model.js";
import generateToken from "../utils/generateToken.js";

export const registerUser = asyncHandler(async (req, res) => {
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
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      addresses: user.addresses,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({
      message: "Invalid credentials",
    });
  }
});

export const getUserProfile = asyncHandler(async (req, res) => {
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
    console.error("User not found", req.user?._id);
    res.status(404).json({
      message: "User not found",
    });
  }
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "Logout successful",
    success: true,
  });
});
