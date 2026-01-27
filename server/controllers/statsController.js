import Product from "../models/ProductModel.js";
import Category from "../models/CategoryModel.js";
import Brand from "../models/BrandModel.js";
import Order from "../models/OrderModel.js";
import User from "../models/userModel.js";

// @desc    Get dashboard statistics
// @route   GET /api/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
    const usersCount = await User.countDocuments();
    const productsCount = await Product.countDocuments();
    const categoriesCount = await Category.countDocuments();
    const brandsCount = await Brand.countDocuments();
    const ordersCount = await Order.countDocuments();
     
    //get revenue from complete orders
     const revenueData = await Order.aggregate([
        { $match: { status: { $in: ["paid", "complete", "delivered"]}}},
        {$group: {_id: null, totalRevenue: { $sum: "$total"}}},
     ]);
      const totalRevenue = revenueData[0]?.totalRevenue || 0;

      //get user roles distribution
      const roles = await User.aggregate([
        {
            $group: {
                _id: "$role",
                count: { $sum: 1},
            },
        },
      ]);

      //get category distribution
      const categoryData = await Product.aggregate([
        {
            $lookup:{
                from: "Categories",
                localField: "Category",
                foreignField: "_id",
                as:"CategoryInfo"
            },
        },
        {
            $unwind: "$categoryInfo",
        },
        {
            $group:{
                _id: "$categoryInfo.name",
                count: { $sum: 1},
            }
        }
      ]);

      //get brand distribution
      const brandData = await Product.aggregate([
        {
            $lookup:{
                from: "brands",
                localField: "brand",
                foreignField:"_id",
                as: "brandInfo",
            },
        },
         {
            $unwind: "$brandInfo",
        },
        {
            $group:{
                _id: "$brandInfo.name",
                count: { $sum: 1},
            }
        }
      ]);

      res.json({
        counts:{
            users: usersCount,
            products: productsCount,
            categories: categoriesCount,
            brands: brandsCount,
            orders: ordersCount,
            totalRevenue: totalRevenue,
        },
        roles: roles.map((role) =>({
            name: role._id,
            value: role.count,
        })),
        categories: categoryData.map((category) => ({
            name: category._id,
            value: category.count,
        })),
        brands: brandData.map((brand) => ({
            name: brand._id,
            value: brand.count,
        })),
      });
    };