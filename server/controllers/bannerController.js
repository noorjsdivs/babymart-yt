import Banner from "../models/bannerModel.js";

export const createBanner = async (req, res) => {
    try {
        const { name, title, startForm, image } = req.body;

        if (!name || !title || !startForm || !image) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const existingBanner = await Banner.findOne({ name });
        if (existingBanner) {
            return res.status(400).json({
                success: false,
                message: "Banner with this name already exists"
            });
        }

        const banner = await Banner.create({
            name,
            title,
            startForm,
            image
        });

        res.status(201).json({
            success: true,
            message: "Banner created successfully",
            data: banner
        });
    } catch (error) {
        console.error("Create banner error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

export const getBanners = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: banners.length,
            data: banners
        });
    } catch (error) {
        console.error("Get banners error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

export const getBannerById = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        res.status(200).json({
            success: true,
            data: banner
        });
    } catch (error) {
        console.error("Get banner by ID error:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: "Invalid banner ID format"
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

export const updateBanner = async (req, res) => {
    try {
        const { name, title, startForm, image } = req.body;

        let banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        if (name && name !== banner.name) {
            const existingBanner = await Banner.findOne({ name });
            if (existingBanner && existingBanner._id.toString() !== req.params.id) {
                return res.status(400).json({
                    success: false,
                    message: "Banner with this name already exists"
                });
            }
        }

        banner = await Banner.findByIdAndUpdate(
            req.params.id,
            { 
                name: name || banner.name,
                title: title || banner.title,
                startForm: startForm || banner.startForm,
                image: image || banner.image
            },
            { 
                new: true,
                runValidators: true 
            }
        );

        res.status(200).json({
            success: true,
            message: "Banner updated successfully",
            data: banner
        });
    } catch (error) {
        console.error("Update banner error:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: "Invalid banner ID format"
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

export const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        await Banner.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Banner deleted successfully"
        });
    } catch (error) {
        console.error("Delete banner error:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: "Invalid banner ID format"
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

export default {
    createBanner,
    getBanners,
    getBannerById,
    updateBanner,
    deleteBanner
};