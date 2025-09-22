import express from "express";
import pool from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

// ====================== Handle JWT Secret ======================
let SECRET;

if (process.env.NODE_ENV === "production") {
  // Di production, wajib ada JWT_SECRET
  SECRET = process.env.JWT_SECRET;
  if (!SECRET) {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
} else {
  // Di development, gunakan fallback dengan warning
  SECRET = process.env.JWT_SECRET || "development_secret_key_only";
  if (!process.env.JWT_SECRET) {
    console.warn("⚠️  WARNING: Using development JWT secret. For production, set JWT_SECRET environment variable.");
  }
}

// ====================== Middleware Auth ======================
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token tidak ada" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token tidak valid" });
  }
}

// ====================== Validasi ======================
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 6;
};

// ====================== GET USER PROFILE ======================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, role, created_at FROM users WHERE id=$1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error get user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ====================== UPDATE USER ======================
router.put("/me", authMiddleware, async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Validasi input
    if (email && !validateEmail(email)) {
      return res.status(400).json({ message: "Format email tidak valid" });
    }

    if (password && !validatePassword(password)) {
      return res.status(400).json({ 
        message: "Password minimal 6 karakter" 
      });
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (username) {
      fields.push(`username=$${idx++}`);
      values.push(username);
    }
    if (email) {
      fields.push(`email=$${idx++}`);
      values.push(email);
    }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      fields.push(`password_hash=$${idx++}`);
      values.push(hashed);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "Tidak ada data untuk update" });
    }

    values.push(req.user.id);

    const result = await pool.query(
      `UPDATE users 
       SET ${fields.join(", ")} 
       WHERE id=$${idx} 
       RETURNING id, username, email, role, created_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      const detail = err.detail.toLowerCase();
      if (detail.includes('email')) {
        return res.status(400).json({ message: "Email sudah digunakan" });
      } else if (detail.includes('username')) {
        return res.status(400).json({ message: "Username sudah digunakan" });
      }
    }
    console.error("Error update user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ====================== DELETE USER ======================
router.delete("/me", authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    await client.query("DELETE FROM cart WHERE user_id=$1", [req.user.id]);
    await client.query("DELETE FROM users WHERE id=$1", [req.user.id]);
    
    await client.query('COMMIT');
    res.json({ message: "Akun berhasil dihapus" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error delete user:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

export default router;