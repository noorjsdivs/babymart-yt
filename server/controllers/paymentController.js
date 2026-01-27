import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

dotenv.config();

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create a payment intent
// @route   POST /api/payment/create-intent
// @access  Private
export const createPaymentIntent = async (req, res) => {
    try {
        const { 
            amount, 
            currency = "usd", 
            metadata, 
            paymentMethodTypes = ["card"],
            savePaymentMethod = false,
            customerEmail
        } = req.body;

        // Validate required fields
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid amount is required"
            });
        }

        // Get user's cart items to verify total amount
        const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        // Calculate total from cart (server-side verification)
        const calculatedTotal = cart.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);

        // Add shipping and tax if applicable
        const shippingFee = 5.00; // Example shipping fee
        const tax = calculatedTotal * 0.08; // Example 8% tax
        const serverTotal = (calculatedTotal + shippingFee + tax) * 100; // Convert to cents

        // Verify client amount matches server calculation
        const clientAmount = Math.round(amount * 100); // Convert to cents
        if (Math.abs(serverTotal - clientAmount) > 50) { // Allow small discrepancy
            return res.status(400).json({
                success: false,
                message: "Amount mismatch. Please refresh and try again."
            });
        }

        // Create or retrieve Stripe customer
        let customer;
        if (req.user.stripeCustomerId) {
            try {
                customer = await stripe.customers.retrieve(req.user.stripeCustomerId);
            } catch (error) {
                console.log("Customer not found, creating new one");
            }
        }

        if (!customer) {
            customer = await stripe.customers.create({
                email: req.user.email,
                name: `${req.user.firstName} ${req.user.lastName}`,
                metadata: {
                    userId: req.user._id.toString()
                }
            });

            // Save Stripe customer ID to user
            await User.findByIdAndUpdate(req.user._id, {
                stripeCustomerId: customer.id
            });
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: clientAmount,
            currency: currency,
            customer: customer.id,
            payment_method_types: paymentMethodTypes,
            metadata: {
                ...metadata,
                userId: req.user._id.toString(),
                orderId: metadata?.orderId || `temp_${Date.now()}`,
                cartId: cart._id.toString()
            },
            description: `Payment for order from ${req.user.email}`,
            setup_future_usage: savePaymentMethod ? 'off_session' : undefined,
            shipping: {
                name: req.user.firstName + " " + req.user.lastName,
                address: {
                    line1: req.user.shippingAddress?.street || "N/A",
                    city: req.user.shippingAddress?.city || "N/A",
                    state: req.user.shippingAddress?.state || "N/A",
                    postal_code: req.user.shippingAddress?.zipCode || "N/A",
                    country: req.user.shippingAddress?.country || "US"
                }
            }
        });

        // Create temporary order record
        const tempOrder = new Order({
            user: req.user._id,
            items: cart.items.map(item => ({
                product: item.product._id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
                image: item.product.images[0]
            })),
            shippingAddress: req.user.shippingAddress,
            paymentMethod: "card",
            paymentIntentId: paymentIntent.id,
            totalPrice: amount,
            status: "pending",
            isPaid: false
        });

        await tempOrder.save();

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            customerId: customer.id,
            orderId: tempOrder._id,
            metadata: {
                amount: amount,
                currency: currency,
                created: paymentIntent.created
            }
        });

    } catch (error) {
        console.error("Create payment intent error:", error);
        res.status(500).json({
            success: false,
            message: "Error creating payment intent",
            error: error.message
        });
    }
};

// @desc    Handle Stripe webhook events
// @route   POST /api/payment/webhook
// @access  Public (Stripe calls this directly)
export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        // Handle the event
        switch (event.type) {
            case "payment_intent.succeeded":
                await handlePaymentIntentSucceeded(event.data.object);
                break;

            case "payment_intent.payment_failed":
                await handlePaymentIntentFailed(event.data.object);
                break;

            case "payment_intent.canceled":
                await handlePaymentIntentCanceled(event.data.object);
                break;

            case "charge.succeeded":
                await handleChargeSucceeded(event.data.object);
                break;

            case "charge.refunded":
                await handleChargeRefunded(event.data.object);
                break;

            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
                await handleSubscriptionEvent(event.type, event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error("Webhook handler error:", error);
        res.status(500).json({ error: "Webhook handler failed" });
    }
};

// Helper function: Handle successful payment
const handlePaymentIntentSucceeded = async (paymentIntent) => {
    try {
        const { id, amount, metadata, customer } = paymentIntent;
        const userId = metadata.userId;
        const orderId = metadata.orderId;

        console.log(`Payment succeeded for intent ${id}, amount: ${amount}`);

        // Find the order
        let order;
        if (orderId && !orderId.startsWith("temp_")) {
            order = await Order.findById(orderId);
        } else {
            // Find order by paymentIntentId
            order = await Order.findOne({ paymentIntentId: id });
        }

        if (order) {
            // Update order status
            order.isPaid = true;
            order.paidAt = Date.now();
            order.status = "processing";
            order.paymentResult = {
                id: paymentIntent.id,
                status: paymentIntent.status,
                update_time: new Date().toISOString(),
                email_address: customer?.email || metadata.email
            };

            // Update product stock
            for (const item of order.items) {
                await Product.findByIdAndUpdate(
                    item.product,
                    { $inc: { countInStock: -item.quantity } }
                );
            }

            // Clear user's cart
            await Cart.findOneAndUpdate(
                { user: userId },
                { $set: { items: [] } }
            );

            await order.save();

            // TODO: Send confirmation email
            // await sendOrderConfirmationEmail(order.user, order);

            console.log(`Order ${order._id} updated to paid`);
        } else {
            console.warn(`No order found for payment intent ${id}`);
        }
    } catch (error) {
        console.error("Error handling payment intent success:", error);
    }
};

// Helper function: Handle failed payment
const handlePaymentIntentFailed = async (paymentIntent) => {
    try {
        const { id, last_payment_error } = paymentIntent;

        console.log(`Payment failed for intent ${id}:`, last_payment_error?.message);

        // Find and update order
        const order = await Order.findOne({ paymentIntentId: id });
        if (order) {
            order.status = "payment_failed";
            order.paymentError = {
                code: last_payment_error?.code,
                message: last_payment_error?.message,
                type: last_payment_error?.type
            };
            await order.save();

            // TODO: Send payment failed notification
        }
    } catch (error) {
        console.error("Error handling payment intent failure:", error);
    }
};

// Helper function: Handle canceled payment
const handlePaymentIntentCanceled = async (paymentIntent) => {
    try {
        const { id } = paymentIntent;

        console.log(`Payment canceled for intent ${id}`);

        // Update order status
        await Order.findOneAndUpdate(
            { paymentIntentId: id },
            { 
                status: "canceled",
                canceledAt: Date.now()
            }
        );
    } catch (error) {
        console.error("Error handling payment intent cancelation:", error);
    }
};

// Helper function: Handle successful charge
const handleChargeSucceeded = async (charge) => {
    try {
        console.log(`Charge ${charge.id} succeeded for ${charge.amount} ${charge.currency}`);
        
        // You can add additional charge-specific logic here
        // For example, updating transaction records
    } catch (error) {
        console.error("Error handling charge success:", error);
    }
};

// Helper function: Handle refund
const handleChargeRefunded = async (charge) => {
    try {
        const { id, payment_intent, refunds } = charge;
        
        console.log(`Charge ${id} refunded`);

        // Find the order
        const order = await Order.findOne({ paymentIntentId: payment_intent });
        if (order) {
            order.status = "refunded";
            order.refundedAt = Date.now();
            order.refundDetails = {
                refundId: refunds.data[0]?.id,
                amount: refunds.data[0]?.amount,
                reason: refunds.data[0]?.reason
            };

            // Restore product stock
            for (const item of order.items) {
                await Product.findByIdAndUpdate(
                    item.product,
                    { $inc: { countInStock: item.quantity } }
                );
            }

            await order.save();

            // TODO: Send refund notification
        }
    } catch (error) {
        console.error("Error handling charge refund:", error);
    }
};

// Helper function: Handle subscription events
const handleSubscriptionEvent = async (eventType, subscription) => {
    try {
        const { id, customer, status, items } = subscription;
        const userId = subscription.metadata?.userId;

        console.log(`Subscription ${eventType}: ${id}, status: ${status}`);

        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                user.subscription = {
                    stripeSubscriptionId: id,
                    stripeCustomerId: customer,
                    status: status,
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    plan: items.data[0]?.price?.id || "default"
                };

                if (eventType === "customer.subscription.deleted") {
                    user.subscription.status = "canceled";
                    user.subscription.canceledAt = Date.now();
                }

                await user.save();
            }
        }
    } catch (error) {
        console.error("Error handling subscription event:", error);
    }
};

// Additional helper endpoints (optional - you can add these as separate routes)

// @desc    Get payment intent status
// @route   GET /api/payment/intent/:id
// @access  Private
export const getPaymentIntentStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const paymentIntent = await stripe.paymentIntents.retrieve(id);
        
        // Verify user owns this payment intent
        const order = await Order.findOne({ 
            paymentIntentId: id,
            user: req.user._id 
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Payment intent not found"
            });
        }

        res.status(200).json({
            success: true,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            created: paymentIntent.created,
            orderId: order._id,
            orderStatus: order.status
        });
    } catch (error) {
        console.error("Get payment intent status error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching payment intent status"
        });
    }
};

// @desc    Refund a payment
// @route   POST /api/payment/refund
// @access  Private/Admin
export const createRefund = async (req, res) => {
    try {
        const { paymentIntentId, amount, reason } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: "Payment intent ID is required"
            });
        }

        // Create refund in Stripe
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents
            reason: reason || "requested_by_customer"
        });

        res.status(200).json({
            success: true,
            refundId: refund.id,
            status: refund.status,
            amount: refund.amount,
            currency: refund.currency
        });
    } catch (error) {
        console.error("Create refund error:", error);
        res.status(500).json({
            success: false,
            message: "Error creating refund",
            error: error.message
        });
    }
};

// @desc    Save payment method for future use
// @route   POST /api/payment/setup-intent
// @access  Private
export const createSetupIntent = async (req, res) => {
    try {
        const { customerId } = req.body;

        const setupIntent = await stripe.setupIntents.create({
            customer: customerId || req.user.stripeCustomerId,
            payment_method_types: ["card"],
            usage: "off_session",
            metadata: {
                userId: req.user._id.toString()
            }
        });

        res.status(200).json({
            success: true,
            clientSecret: setupIntent.client_secret,
            setupIntentId: setupIntent.id
        });
    } catch (error) {
        console.error("Create setup intent error:", error);
        res.status(500).json({
            success: false,
            message: "Error creating setup intent"
        });
    }
};