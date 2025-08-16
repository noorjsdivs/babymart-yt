import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";

// @desc    Get all orders for a user
// @route   GET /api/orders
// @access  Private
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).populate(
    "items.productId"
  );
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.productId");

  if (
    order &&
    (req.user.role === "admin" ||
      order.userId.toString() === req.user._id.toString())
  ) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Create order from cart
// @route   POST /api/orders
// @access  Private
export const createOrderFromCart = asyncHandler(async (req, res) => {
  const { items, shippingAddress } = req.body;

  // Validate that items are provided
  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("Cart items are required");
  }

  // Validate shipping address
  if (
    !shippingAddress ||
    !shippingAddress.street ||
    !shippingAddress.city ||
    !shippingAddress.country ||
    !shippingAddress.postalCode
  ) {
    res.status(400);
    throw new Error(
      "Shipping address is required with all fields (street, city, country, postalCode)"
    );
  }

  // Validate each item structure
  const validItems = items.map((item) => {
    if (!item._id || !item.name || !item.price || !item.quantity) {
      res.status(400);
      throw new Error("Invalid item structure");
    }
    return {
      productId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    };
  });

  // Calculate total
  const total = validItems.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  // Create order with "pending" status (will be updated to "paid" after successful payment)
  const order = await Order.create({
    userId: req.user._id,
    items: validItems,
    total,
    status: "pending",
    shippingAddress,
  });

  res.status(201).json({
    success: true,
    order,
    message: "Order created successfully",
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = asyncHandler(async (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "Request body is missing",
    });
  }

  const { status, paymentIntentId, stripeSessionId } = req.body;

  // Validate status
  const validStatuses = ["pending", "paid", "completed", "cancelled"];
  if (!status || !validStatuses.includes(status)) {
    res.status(400);
    throw new Error(
      "Invalid status. Must be one of: pending, paid, completed, cancelled"
    );
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Check authorization based on order status and user role
  // - Users can only update their own orders when status is "pending"
  // - Admins can update any order at any time
  // - Webhook calls (no req.user) are always allowed
  if (req.user) {
    const isOwner = order.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isPending = order.status === "pending";

    // If user is not admin and (not owner OR order is not pending), deny access
    if (!isAdmin && (!isOwner || !isPending)) {
      res.status(403);
      throw new Error(
        isPending
          ? "Not authorized to update this order"
          : "Order status can only be updated by admin after payment"
      );
    }
  }

  // Prepare update object
  const updateData = {
    status,
    updatedAt: new Date(),
  };

  // If marking as paid, store payment information and timestamp
  if (status === "paid") {
    if (paymentIntentId) {
      updateData.paymentIntentId = paymentIntentId;
    }
    if (stripeSessionId) {
      updateData.stripeSessionId = stripeSessionId;
    }
    updateData.paidAt = new Date();
  }

  // Use findByIdAndUpdate to avoid full document validation
  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: false, // Disable validation to avoid shipping address issues
    }
  );

  res.json({
    success: true,
    order: updatedOrder,
    message: `Order status updated to ${status}`,
  });
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Check if user owns this order or is an admin
  if (
    req.user.role !== "admin"
    // && order.userId.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this order");
  }

  // Only allow deletion if order is still pending
  // if (order.status !== "pending") {
  //   res.status(400);
  //   throw new Error("Cannot delete order that has been processed");
  // }

  await Order.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Order deleted successfully",
  });
});

// @desc    Get all orders for admin
// @route   GET /api/orders/admin
// @access  Private/Admin
export const getAllOrdersAdmin = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
  const status = req.query.status;
  const paymentStatus = req.query.paymentStatus;

  // Build filter object
  const filter = {};
  if (status && status !== "all") {
    filter.status = status;
  }
  if (paymentStatus && paymentStatus !== "all") {
    // Map payment status to actual status values
    if (paymentStatus === "paid") {
      filter.status = { $in: ["paid", "completed"] };
    } else if (paymentStatus === "pending") {
      filter.status = "pending";
    } else if (paymentStatus === "failed") {
      filter.status = "cancelled";
    }
  }

  const skip = (page - 1) * perPage;

  const orders = await Order.find(filter)
    .populate("userId", "name email")
    .populate("items.productId", "name price image")
    .sort({ createdAt: sortOrder })
    .skip(skip)
    .limit(perPage);

  const total = await Order.countDocuments(filter);
  const totalPages = Math.ceil(total / perPage);

  // Transform data to match frontend expectations
  const transformedOrders = orders.map((order) => ({
    _id: order._id,
    orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
    user: {
      _id: order.userId._id,
      name: order.userId.name,
      email: order.userId.email,
    },
    items: order.items.map((item) => ({
      product: {
        _id: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        image: item.productId.image,
      },
      quantity: item.quantity,
      price: item.price,
    })),
    totalAmount: order.total,
    status: order.status,
    paymentStatus:
      order.status === "paid" || order.status === "completed"
        ? "paid"
        : order.status === "cancelled"
        ? "failed"
        : "pending",
    shippingAddress: order.shippingAddress || {
      street: "N/A",
      city: "N/A",
      state: "N/A",
      zipCode: "N/A",
      country: "N/A",
    },
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }));

  res.json({
    orders: transformedOrders,
    total,
    totalPages,
    currentPage: page,
  });
});
