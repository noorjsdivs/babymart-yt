import express from "express";
import { admin, protect } from "../middleware/authMiddleware.js";
import { getStats } from "../controllers/statsController.js";


const router = express.Router();

// Protect stats route with admin access
router.route("/").get(protect, admin, getStats);

export default router;