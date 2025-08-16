import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createPaymentIntent,
  handleStripeWebhook,
} from "../controllers/paymentController.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentIntent:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         clientSecret:
 *           type: string
 *         paymentIntentId:
 *           type: string
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /api/payments/create-intent:
 *   post:
 *     summary: Create a payment intent for order payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - amount
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: ID of the order to pay for
 *               amount:
 *                 type: number
 *                 description: Payment amount in dollars
 *               currency:
 *                 type: string
 *                 default: usd
 *                 description: Payment currency
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentIntent'
 *       400:
 *         description: Bad request - missing required fields or order already paid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to pay for this order
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.post("/create-intent", protect, createPaymentIntent);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Handle Stripe webhook events
 *     tags: [Payments]
 *     description: Webhook endpoint for Stripe to notify about payment events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Webhook signature verification failed
 */
router.post("/webhook", handleStripeWebhook);

export default router;
