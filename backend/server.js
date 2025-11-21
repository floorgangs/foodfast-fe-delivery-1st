import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.CUSTOMER_WEB_URL || "http://localhost:5173",
      process.env.RESTAURANT_WEB_URL || "http://localhost:5174",
      process.env.ADMIN_WEB_URL || "http://localhost:5175",
    ],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: [
      process.env.CUSTOMER_WEB_URL || "http://localhost:5173",
      process.env.RESTAURANT_WEB_URL || "http://localhost:5174",
      process.env.ADMIN_WEB_URL || "http://localhost:5175",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
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

// Error handler
app.use(errorHandler);

// Database connection and server start
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.io ready for real-time connections`);
  });
});

export { io };
