// backend/setupAdmin.js
import pool from "./db.js";
import bcrypt from "bcryptjs";

export async function setupAdmin() {
  try {
    // Cek apakah admin sudah ada
    const existingAdmin = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      ["admin"]
    );

    if (existingAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10); // ganti password default
      await pool.query(
        "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, 'admin')",
        ["admin", hashedPassword]
      );
      console.log("✅ Admin berhasil dibuat (username: admin, password: admin123)");
    } else {
      console.log("ℹ️ Admin sudah ada");
    }
  } catch (err) {
    console.error("Error setup admin:", err);
  }
}
