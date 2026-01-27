import express from 'express';
import {
    getUsers,
    createUser,
    getUsersById,
    updateUser,
    deleteUser,
    addAddress,
    updateAddress,
    deleteAddress
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Admin only routes
router.route('/')
    .get(admin, getUsers)          // GET /api/users - Get all users (Admin only)
    .post(admin, createUser);      // POST /api/users - Create user (Admin only)

// User-specific routes (user themselves or admin)
router.route('/:id')
    .get(getUsersById)             // GET /api/users/:id - Get user by ID
    .put(updateUser)               // PUT /api/users/:id - Update user
    .delete(admin, deleteUser);    // DELETE /api/users/:id - Delete user (Admin only)

// Address routes
router.route('/:id/addresses')
    .post(addAddress);             // POST /api/users/:id/addresses - Add address

router.route('/:id/addresses/:addressId')
    .put(updateAddress)            // PUT /api/users/:id/addresses/:addressId - Update address
    .delete(deleteAddress);        // DELETE /api/users/:id/addresses/:addressId - Delete address

export default router;