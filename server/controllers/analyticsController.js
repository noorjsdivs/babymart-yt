// @desc    Get analytics overview
// @route   GET /api/analytics/overview
// @access  Private/Admin
export const getAnalyticsOverview = async (req, res) => {
    try {
        // This would typically fetch data from your database
        // For example, using Mongoose with MongoDB:
        // const orders = await Order.find({...});
        // const products = await Product.find({...});
        // const users = await User.find({...});

        // Mock data for demonstration
        const overviewData = {
            totalRevenue: 125000,
            totalOrders: 850,
            totalProducts: 245,
            totalCustomers: 520,
            averageOrderValue: 147.06,
            conversionRate: 3.2,
            revenueGrowth: 15.4,
            orderGrowth: 8.2,
            topPerformingCategory: "Electronics",
            lowStockItems: 12,
            recentSales: [
                { date: "2024-01-20", amount: 1250, orders: 15 },
                { date: "2024-01-19", amount: 980, orders: 12 },
                { date: "2024-01-18", amount: 1420, orders: 18 }
            ]
        };

        res.status(200).json(overviewData);
    } catch (error) {
        console.error("Overview analytics error:", error);
        res.status(500).json({ 
            message: "Error fetching analytics overview", 
            error: error.message 
        });
    }
};

// @desc    Get product analytics
// @route   GET /api/analytics/products
// @access  Private/Admin
export const getProductAnalytics = async (req, res) => {
    try {
        const { period = "monthly", limit = 10 } = req.query;
        
        // Mock product analytics data
        const productAnalytics = {
            period: period,
            totalProducts: 245,
            activeProducts: 210,
            outOfStock: 15,
            lowStock: 20,
            topSellingProducts: [
                { id: "P001", name: "Wireless Headphones", sales: 320, revenue: 25600, unitsSold: 320 },
                { id: "P002", name: "Smart Watch", sales: 280, revenue: 42000, unitsSold: 140 },
                { id: "P003", name: "Laptop Stand", sales: 450, revenue: 22500, unitsSold: 450 },
                { id: "P004", name: "USB-C Cable", sales: 600, revenue: 9000, unitsSold: 600 },
                { id: "P005", name: "Bluetooth Speaker", sales: 190, revenue: 28500, unitsSold: 190 }
            ],
            productPerformance: {
                categories: ["Electronics", "Accessories", "Home", "Office"],
                revenueByCategory: [65000, 32000, 18000, 10000],
                unitsByCategory: [450, 800, 120, 75]
            }
        };

        res.status(200).json(productAnalytics);
    } catch (error) {
        console.error("Product analytics error:", error);
        res.status(500).json({ 
            message: "Error fetching product analytics", 
            error: error.message 
        });
    }
};

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
// @access  Private/Admin
export const getSalesAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = "daily" } = req.query;
        
        // Mock sales analytics data
        const salesAnalytics = {
            period: { startDate, endDate },
            groupBy: groupBy,
            totalSales: 850,
            totalRevenue: 125000,
            averageOrderValue: 147.06,
            salesData: [
                { date: "2024-01-01", sales: 12500, orders: 85 },
                { date: "2024-01-02", sales: 11800, orders: 79 },
                { date: "2024-01-03", sales: 14200, orders: 95 },
                { date: "2024-01-04", sales: 9800, orders: 65 },
                { date: "2024-01-05", sales: 15600, orders: 104 },
                { date: "2024-01-06", sales: 13200, orders: 88 },
                { date: "2024-01-07", sales: 14700, orders: 98 }
            ],
            paymentMethods: {
                creditCard: { count: 520, amount: 78000 },
                paypal: { count: 180, amount: 25000 },
                cash: { count: 150, amount: 22000 }
            }
        };

        res.status(200).json(salesAnalytics);
    } catch (error) {
        console.error("Sales analytics error:", error);
        res.status(500).json({ 
            message: "Error fetching sales analytics", 
            error: error.message 
        });
    }
};

// @desc    Get inventory alerts
// @route   GET /api/analytics/inventory/alerts
// @access  Private/Admin
export const getInventoryAlert = async (req, res) => {
    try {
        const threshold = req.query.threshold || 10;
        
        // Mock inventory alert data
        const inventoryAlerts = {
            threshold: threshold,
            lowStockItems: [
                { 
                    id: "P012", 
                    name: "Wireless Earbuds", 
                    currentStock: 8, 
                    minStock: 20, 
                    lastRestock: "2024-01-10",
                    supplier: "TechGear Inc"
                },
                { 
                    id: "P023", 
                    name: "Phone Case - Black", 
                    currentStock: 5, 
                    minStock: 15, 
                    lastRestock: "2024-01-05",
                    supplier: "CaseMasters"
                },
                { 
                    id: "P045", 
                    name: "HDMI Cable 2m", 
                    currentStock: 3, 
                    minStock: 25, 
                    lastRestock: "2023-12-28",
                    supplier: "CablePro"
                }
            ],
            outOfStockItems: [
                { 
                    id: "P067", 
                    name: "Gaming Mouse", 
                    lastStock: 0, 
                    minStock: 10, 
                    outSince: "2024-01-15",
                    supplier: "GamingTech",
                    reorderStatus: "Pending"
                }
            ],
            summary: {
                totalLowStock: 12,
                totalOutOfStock: 5,
                urgentRestock: 3,
                estimatedCost: 4500
            }
        };

        res.status(200).json(inventoryAlerts);
    } catch (error) {
        console.error("Inventory alerts error:", error);
        res.status(500).json({ 
            message: "Error fetching inventory alerts", 
            error: error.message 
        });
    }
};

// @desc    Get top products
// @route   GET /api/analytics/sales/top-products
// @access  Private/Admin
export const getTopProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        const topProducts = {
            period: "last 30 days",
            products: [
                { rank: 1, productId: "P001", name: "Wireless Headphones", unitsSold: 320, revenue: 25600 },
                { rank: 2, productId: "P002", name: "Smart Watch", unitsSold: 140, revenue: 42000 },
                { rank: 3, productId: "P003", name: "Laptop Stand", unitsSold: 450, revenue: 22500 },
                { rank: 4, productId: "P004", name: "USB-C Cable", unitsSold: 600, revenue: 9000 },
                { rank: 5, productId: "P005", name: "Bluetooth Speaker", unitsSold: 190, revenue: 28500 }
            ].slice(0, limit)
        };

        res.status(200).json(topProducts);
    } catch (error) {
        console.error("Top products error:", error);
        res.status(500).json({ 
            message: "Error fetching top products", 
            error: error.message 
        });
    }
};

// @desc    Get sales trends
// @route   GET /api/analytics/sales/trends
// @access  Private/Admin
export const getSalesTrends = async (req, res) => {
    try {
        const { period = "weekly" } = req.query;
        
        const salesTrends = {
            period: period,
            trends: {
                revenue: [12500, 11800, 14200, 9800, 15600, 13200, 14700],
                orders: [85, 79, 95, 65, 104, 88, 98],
                averageOrderValue: [147.06, 149.37, 149.47, 150.77, 150.00, 150.00, 150.00],
                dates: ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04", "2024-01-05", "2024-01-06", "2024-01-07"]
            },
            growth: {
                revenue: 15.4,
                orders: 8.2,
                averageOrderValue: 2.1
            }
        };

        res.status(200).json(salesTrends);
    } catch (error) {
        console.error("Sales trends error:", error);
        res.status(500).json({ 
            message: "Error fetching sales trends", 
            error: error.message 
        });
    }
};

// @desc    Get customer analytics
// @route   GET /api/analytics/customers
// @access  Private/Admin
export const getCustomerAnalytics = async (req, res) => {
    try {
        const customerAnalytics = {
            totalCustomers: 520,
            newCustomers: 45,
            returningCustomers: 320,
            customerSegments: {
                frequent: { count: 85, percentage: 16.3 },
                regular: { count: 235, percentage: 45.2 },
                occasional: { count: 200, percentage: 38.5 }
            },
            lifetimeValue: {
                average: 240.38,
                topSegment: 850.50,
                bottomSegment: 75.25
            },
            retentionRate: 72.5,
            acquisitionChannels: {
                organic: 35,
                socialMedia: 28,
                emailMarketing: 22,
                referrals: 15
            }
        };

        res.status(200).json(customerAnalytics);
    } catch (error) {
        console.error("Customer analytics error:", error);
        res.status(500).json({ 
            message: "Error fetching customer analytics", 
            error: error.message 
        });
    }
};

// @desc    Get revenue by category
// @route   GET /api/analytics/products/categories
// @access  Private/Admin
export const getRevenueByCategory = async (req, res) => {
    try {
        const revenueByCategory = {
            categories: [
                { name: "Electronics", revenue: 65000, percentage: 52, products: 45 },
                { name: "Accessories", revenue: 32000, percentage: 25.6, products: 85 },
                { name: "Home", revenue: 18000, percentage: 14.4, products: 60 },
                { name: "Office", revenue: 10000, percentage: 8, products: 55 }
            ],
            totalRevenue: 125000
        };

        res.status(200).json(revenueByCategory);
    } catch (error) {
        console.error("Revenue by category error:", error);
        res.status(500).json({ 
            message: "Error fetching revenue by category", 
            error: error.message 
        });
    }
};