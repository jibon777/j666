import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

import authRouter from "./routes/auth.js";
import productsRouter from "./routes/products.js";
import cartRouter from "./routes/cart.js";
import usersRouter from "./routes/users.js";

import { setupAdmin } from "./setupAdmin.js";

// Load environment variables dari .env
dotenv.config();

const app = express();

// =======================
// Middleware global
// =======================
app.use(express.json());
app.use(cors());

// Serve file statis dari folder uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// =======================
// API Routes
// =======================
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/users", usersRouter);

// Root endpoint
app.get("/", (req, res) => {
  res.send("🚀 Server running...");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.stack);
  res.status(500).json({ message: "Server error" });
});

// =======================
// Start server
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  await setupAdmin();
});
