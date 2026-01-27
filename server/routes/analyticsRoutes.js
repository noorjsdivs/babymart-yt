import express from "express";
import {
    getAnalyticsOverview,
    getProductAnalytics,
    getSalesAnalytics,
    getInventoryAlert,
    getTopProducts,
    getSalesTrends,
    getCustomerAnalytics,
    getRevenueByCategory
} from "../controllers/analyticsController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All analytics routes require admin authentication
router.use(protect);
router.use(admin);

// Overview analytics
router.get("/overview", getAnalyticsOverview);

// Sales analytics
router.get("/sales", getSalesAnalytics);
router.get("/sales/trends", getSalesTrends);
router.get("/sales/top-products", getTopProducts);

// Product analytics
router.get("/products", getProductAnalytics);
router.get("/products/categories", getRevenueByCategory);

// Inventory alerts
router.get("/inventory/alerts", getInventoryAlert);

// Customer analytics
router.get("/customers", getCustomerAnalytics);

// Date range analytics (optional - add if needed)
router.get("/custom-date-range", (req, res) => {
    // You can implement this later
    res.status(200).json({ message: "Custom date range analytics endpoint" });
});

export default router;