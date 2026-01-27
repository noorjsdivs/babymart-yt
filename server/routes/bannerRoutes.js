import express from "express";
import bannerController from "../controllers/bannerController.js"; // Default import
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(bannerController.getBanners)
    .post(protect, admin, bannerController.createBanner);

router.route("/:id")
    .get(bannerController.getBannerById)
    .put(protect, admin, bannerController.updateBanner)
    .delete(protect, admin, bannerController.deleteBanner);

export default router;