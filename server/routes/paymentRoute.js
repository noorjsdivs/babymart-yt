import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import { 
    createPaymentIntent,
    handleStripeWebhook,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-intent", protect, createPaymentIntent);

router.post("/webhook", handleStripeWebhook);

export default router;