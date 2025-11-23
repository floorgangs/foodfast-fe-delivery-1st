import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import os from "os";
import { connectDB } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import {
  cleanupExpiredOrders,
  cleanupOldPendingOrders,
} from "./utils/orderCleanup.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import droneRoutes from "./routes/droneRoutes.js";
import voucherRoutes from "./routes/voucherRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import savedOrderRoutes from "./routes/savedOrderRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const parseOrigins = (value, fallback = []) => {
  const entries = [...fallback];

  if (value) {
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => entries.push(item));
  }

  return Array.from(new Set(entries));
};

const collectLanOrigins = () => {
  const nets = os.networkInterfaces();
  const lanIps = [];

  Object.values(nets).forEach((interfaces = []) => {
    interfaces.forEach((net) => {
      if (net && net.family === "IPv4" && !net.internal) {
        lanIps.push(net.address);
      }
    });
  });

  const ports = [5173, 5174, 5175, 3000, 3001];
  const lanOrigins = [];

  lanIps.forEach((ip) => {
    ports.forEach((port) => {
      lanOrigins.push(`http://${ip}:${port}`);
    });
  });

  return lanOrigins;
};

const customerWebOrigins = parseOrigins(process.env.CUSTOMER_WEB_URL, [
  "http://localhost:5173",
  "http://localhost:3000",
]);

const restaurantWebOrigins = parseOrigins(process.env.RESTAURANT_WEB_URL, [
  "http://localhost:5174",
  "http://localhost:3001",
  "http://localhost:3002",
]);

const adminWebOrigins = parseOrigins(process.env.ADMIN_WEB_URL, [
  "http://localhost:5175",
  "http://localhost:3004",
  "http://localhost:3003",
  "http://localhost:3005",
  "http://localhost:3006",
]);

const additionalOrigins = parseOrigins(
  process.env.ADDITIONAL_ALLOWED_ORIGINS,
  []
);

const mobileOrigins = parseOrigins(process.env.CUSTOMER_MOBILE_URL, [
  "exp://localhost:8081",
]);

const allowedOrigins = Array.from(
  new Set([
    ...customerWebOrigins,
    ...restaurantWebOrigins,
    ...adminWebOrigins,
    ...additionalOrigins,
    ...collectLanOrigins(),
  ])
);

// Socket.io setup with mobile support
const socketOrigins = [
  ...allowedOrigins,
  ...mobileOrigins,
  /^exp:\/\/.*:8081$/, // Support Expo connections
  /^http:\/\/.*:19006$/, // Support Expo web
];

const io = new Server(httpServer, {
  cors: {
    origin: socketOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Middleware with mobile CORS support
const corsOrigins = [
  ...allowedOrigins,
  ...mobileOrigins,
  /^exp:\/\/.*:8081$/, // Support Expo connections
  /^http:\/\/.*:19006$/, // Support Expo web
];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Increase payload limit for base64 images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  req.app = app;
  next();
});

// Store io in app for access in controllers
app.set("io", io);

// Socket.io connection
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // Join rooms based on user role
  socket.on("join_room", (data) => {
    const { userId, role, restaurantId } = data;

    if (role === "customer") {
      socket.join(`customer_${userId}`);
      console.log(`Customer ${userId} joined room`);
    } else if (role === "restaurant" && restaurantId) {
      socket.join(`restaurant_${restaurantId}`);
      console.log(`Restaurant ${restaurantId} joined room`);
    } else if (role === "admin") {
      socket.join("admin");
      console.log("Admin joined room");
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FoodFast API Server",
    version: "1.0.0",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/drones", droneRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/saved-orders", savedOrderRoutes);
app.use("/api/deliveries", deliveryRoutes);

// Error handler
app.use(errorHandler);

// Database connection and server start
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

connectDB().then(() => {
  // Start cron jobs for automatic order cleanup
  cleanupExpiredOrders(); // Clean expired orders every 5 minutes
  cleanupOldPendingOrders(); // Clean old pending orders daily

  httpServer.listen(PORT, HOST, () => {
    const nets = os.networkInterfaces();
    const addresses = [];
    Object.values(nets).forEach((interfaces = []) => {
      interfaces.forEach((net) => {
        if (net && net.family === "IPv4" && !net.internal) {
          addresses.push(`http://${net.address}:${PORT}`);
        }
      });
    });

    console.log(
      `🚀 Server running on http://${
        HOST === "0.0.0.0" ? "localhost" : HOST
      }:${PORT}`
    );
    if (addresses.length) {
      console.log(`🌐 Accessible on: ${addresses.join(", ")}`);
    }
    if (allowedOrigins.length) {
      console.log(`🌍 Allowed web origins: ${allowedOrigins.join(", ")}`);
    }
    if (mobileOrigins.length) {
      console.log(`📱 Allowed mobile origins: ${mobileOrigins.join(", ")}`);
    }
    console.log(`📡 Socket.io ready for real-time connections`);
  });
});

export { io };
