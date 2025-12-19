import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  addAddress,
  createUser,
  deleteAddress,
  deleteUser,
  getAllUsers,
  getUserById,
  updateAddress,
  updateUser,
} from "../controllers/user.controller.js";

const userRouter = express.Router();

// /route
userRouter
  .route("/")
  .get(protect, admin, getAllUsers)
  .post(protect, admin, createUser);

// /:id route
userRouter
  .route("/:id")
  .get(protect, getUserById)
  .put(protect, updateUser)
  .delete(protect, deleteUser);

// /:id/address route
userRouter.route("/:id/address").post(protect, addAddress);

// /:id/address/:addressId route
userRouter
  .route("/:id/addresses/:addressId")
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

export default userRouter;
