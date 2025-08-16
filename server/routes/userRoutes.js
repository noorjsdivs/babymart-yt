import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  addAddress,
  createUser,
  deleteAddress,
  deleteUser,
  getUserById,
  getUsers,
  updateAddress,
  updateUser,
} from "../controllers/userController.js";

const router = express.Router();

// / route
router
  .route("/")
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);
// /:id route
router
  .route("/:id")
  .get(protect, getUserById)
  .put(protect, updateUser)
  .delete(protect, admin, deleteUser); // Removed admin middleware for self-updates

router.route("/:id/addresses").post(protect, addAddress);
router;

router
  .route("/:id/addresses/:addressId")
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

export default router;
