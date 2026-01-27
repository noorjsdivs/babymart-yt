import express from "express";
import {
    getOrders,
    getOrderById,
    createOrderFromCart,
    updateOrderStatus,
    deleteOrder,
    getAllOrdersAdmin
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (if any) - none in this case

// Admin only routes
router.route("/admin").get(protect, admin, getAllOrdersAdmin); // Get all orders (admin)

// Protected routes (user must be logged in)
router.route("/").get(protect, getOrders)// Get user's own orders
.post(protect, createOrderFromCart); // Create order from cart

// Order by ID routes
router.route("/:id")
    .get(protect, getOrderById) // Get specific order
    .delete(protect, admin, deleteOrder); // Delete order (admin)
    
    router.route("/:id/status").put(protect, admin, updateOrderStatus) // Update order status (admin)

    router.route("/:id/webhook-status").put(protect, admin, updateOrderStatus) // Update order status (admin)
    
export default router;