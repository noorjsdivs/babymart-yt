import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorMiddleware.js";
import cors from "cors";

// Load env vars
dotenv.config();

// Connect to database

const app = express();

// Enhanced CORS configuration
const allowedOrigins = [
  process.env.ADMIN_URL,
  process.env.CLIENT_URL,
  // Add production URLs

  // Add localhost for development
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8081", // iOS simulator
  "http://10.0.2.2:8081", // Android emulator
  "http://10.0.2.2:8000", // Android emulator direct access
  // "http://192.168.1.100:8081", // Replace with your actual local IP for physical devices
].filter(Boolean); // Remove any undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // In development, allow all origins for easier testing
      if (process.env.NODE_ENV === "development") {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Increase body size limit for JSON and URL-encoded payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Debug middleware for order routes

// Routes

// API Documentation

// Home route
app.get("/", (req, res) => {
  const projectInfo = {
    name: "🍼 BabyShop E-commerce API",
    version: "1.0.0",
    description: "Backend API server for BabyShop e-commerce platform",
    status: "Running",
    environment: process.env.NODE_ENV || "development",
    port: PORT,
    endpoints: {
      documentation: `/api-docs`,
      health: `/health`,
      api: `/api/v1`,
    },
    features: [
      "🔐 JWT Authentication",
      "📦 Product Management",
      "🛍️ Order Processing",
      "👥 User Management",
      "☁️ Cloudinary Integration",
      "📊 MongoDB Database",
      "📖 Swagger Documentation",
    ],
    applications: {
      "Admin Dashboard": process.env.ADMIN_URL || "http://localhost:5173",
      "Client Website": process.env.CLIENT_URL || "http://localhost:3000",
      "Mobile App": "React Native Application",
      "API Server": `http://localhost:${PORT} (You are here)`,
    },
    quickStart: {
      development: "npm run dev",
      production: "npm start",
      documentation: `Visit http://localhost:${PORT}/api-docs for API documentation`,
    },
    message:
      "🚀 BabyShop API is running successfully! Remove this placeholder and start building your API endpoints.",
  };

  res.json(projectInfo);
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 BabyShop API Server is running!`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(
    `🌐 Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`
  );
  console.log(
    `🖥️  Admin URL: ${process.env.ADMIN_URL || "http://localhost:5173"}`
  );
  console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`📋 Project Info: http://localhost:${PORT}`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`\n🛠️  Ready to start building your e-commerce API!`);
});
