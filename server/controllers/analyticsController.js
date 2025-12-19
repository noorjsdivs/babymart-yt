import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

// @desc    Get analytics overview
// @route   GET /api/analytics/overview
// @access  Private/Admin
const getAnalyticsOverview = asyncHandler(async (req, res) => {
  try {
    // Get total products
    const totalProducts = await Product.countDocuments();

    // Get total orders
    const totalOrders = await Order.countDocuments();

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get total revenue
    const revenueAggregation = await Order.aggregate([
      { $match: { status: { $in: ["paid", "completed"] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
    ]);
    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;

    // Get low stock products (stock < 10)
    const lowStockProducts = await Product.find({ stock: { $lt: 10, $gt: 0 } })
      .select("name stock price images")
      .limit(10);

    // Get out of stock products
    const outOfStockProducts = await Product.find({ stock: 0 })
      .select("name stock price images")
      .limit(10);

    // Get best selling products (based on order frequency)
    const bestSellingProducts = await Order.aggregate([
      { $match: { status: { $in: ["paid", "completed"] } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          productName: { $first: "$items.name" },
          productImage: { $first: "$items.image" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .select("total status createdAt userId items");

    // Get monthly revenue for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: { $in: ["paid", "completed"] },
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Get order status breakdown
    const orderStatusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$total" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalProducts,
          totalOrders,
          totalUsers,
          totalRevenue,
        },
        inventory: {
          lowStockProducts,
          outOfStockProducts,
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length,
        },
        sales: {
          bestSellingProducts,
          recentOrders,
          monthlyRevenue,
          orderStatusBreakdown,
        },
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch analytics data");
  }
});

// @desc    Get product analytics
// @route   GET /api/analytics/products
// @access  Private/Admin
const getProductAnalytics = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = "totalSold",
      sortOrder = "desc",
    } = req.query;
    const skip = (page - 1) * limit;

    // Get detailed product analytics
    const productAnalytics = await Order.aggregate([
      { $match: { status: { $in: ["paid", "completed"] } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          averagePrice: { $avg: "$items.price" },
          orderCount: { $sum: 1 },
          productName: { $first: "$items.name" },
          productImage: { $first: "$items.image" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $addFields: {
          currentStock: { $arrayElemAt: ["$productDetails.stock", 0] },
          category: { $arrayElemAt: ["$productDetails.category", 0] },
          brand: { $arrayElemAt: ["$productDetails.brand", 0] },
        },
      },
      { $sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
    ]);

    // Get total count for pagination
    const totalCount = await Order.aggregate([
      { $match: { status: { $in: ["paid", "completed"] } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.productId" } },
      { $count: "total" },
    ]);

    const total = totalCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        products: productAnalytics,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch product analytics");
  }
});

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
// @access  Private/Admin
const getSalesAnalytics = asyncHandler(async (req, res) => {
  try {
    const { period = "monthly", year = new Date().getFullYear() } = req.query;

    let matchStage = {
      status: { $in: ["paid", "completed"] },
      createdAt: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      },
    };

    let groupStage;

    if (period === "daily") {
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
        avgOrderValue: { $avg: "$total" },
      };
    } else if (period === "weekly") {
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
        avgOrderValue: { $avg: "$total" },
      };
    } else {
      // monthly
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
        avgOrderValue: { $avg: "$total" },
      };
    }

    const salesData = await Order.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } },
    ]);

    // Get top customers
    const topCustomers = await Order.aggregate([
      { $match: { status: { $in: ["paid", "completed"] } } },
      {
        $group: {
          _id: "$userId",
          totalSpent: { $sum: "$total" },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: "$total" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $addFields: {
          customerName: { $arrayElemAt: ["$customer.name", 0] },
          customerEmail: { $arrayElemAt: ["$customer.email", 0] },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        salesData,
        topCustomers,
        period,
        year: parseInt(year),
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch sales analytics");
  }
});

// @desc    Get inventory alerts
// @route   GET /api/analytics/inventory-alerts
// @access  Private/Admin
const getInventoryAlerts = asyncHandler(async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    // Low stock products
    const lowStockProducts = await Product.find({
      stock: { $lte: parseInt(threshold), $gt: 0 },
    }).select("name stock price images category brand createdAt");

    // Out of stock products
    const outOfStockProducts = await Product.find({ stock: 0 }).select(
      "name stock price images category brand createdAt"
    );

    // Products that haven't been updated in a while (30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const staleProducts = await Product.find({
      updatedAt: { $lt: thirtyDaysAgo },
    }).select("name stock price images category brand updatedAt");

    // Products with no sales in the last 30 days
    const soldProductIds = await Order.aggregate([
      {
        $match: {
          status: { $in: ["paid", "completed"] },
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      { $unwind: "$items" },
      { $group: { _id: "$items.productId" } },
    ]);

    const soldIds = soldProductIds.map((item) => item._id);

    const noSalesProducts = await Product.find({
      _id: { $nin: soldIds },
    })
      .select("name stock price images category brand createdAt")
      .limit(20);

    res.json({
      success: true,
      data: {
        lowStockProducts,
        outOfStockProducts,
        staleProducts,
        noSalesProducts,
        counts: {
          lowStock: lowStockProducts.length,
          outOfStock: outOfStockProducts.length,
          staleProducts: staleProducts.length,
          noSales: noSalesProducts.length,
        },
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch inventory alerts");
  }
});

export {
  getAnalyticsOverview,
  getProductAnalytics,
  getSalesAnalytics,
  getInventoryAlerts,
};
