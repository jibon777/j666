// backend/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import crypto from "crypto";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

//
// 📝 REGISTER
//
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "Username, email, dan password wajib diisi" });

    const existing = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );
    if (existing.rows.length > 0)
      return res.status(400).json({ message: "Username atau email sudah digunakan" });

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, 'user')",
      [username, email, hashed]
    );

    res.json({ message: "Registrasi berhasil" });
  } catch (err) {
    console.error("Error register:", err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

//
// 🔐 LOGIN (username/email + password)
//
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier bisa username ATAU email

    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $1",
      [identifier]
    );
    if (result.rows.length === 0)
      return res.status(400).json({ message: "Username/email atau password salah" });

    const user = result.rows[0];

    if (!user.password_hash)
      return res.status(500).json({ message: "User belum memiliki password" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(400).json({ message: "Username/email atau password salah" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login berhasil",
      token,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error("Error login:", err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

export default router;
