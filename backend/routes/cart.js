import express from "express";
import pool from "../db.js";
import { authMiddleware } from "../middleware/authMiddleware.js"; // import dari middleware khusus

const router = express.Router();

// GET CART
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.quantity, p.id AS product_id, p.name, p.price, p.stock, p.image_url
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal ambil cart" });
  }
});

// ADD TO CART
router.post("/", authMiddleware, async (req, res) => {
  const { product_id, quantity } = req.body;
  if (!product_id) return res.status(400).json({ message: "Product ID wajib" });

  if (req.user.role === "admin") {
    return res.status(403).json({ message: "Admin tidak bisa menambahkan produk ke keranjang" });
  }

  const qty = quantity && quantity > 0 ? quantity : 1;

  try {
    const check = await pool.query(
      "SELECT * FROM cart WHERE user_id=$1 AND product_id=$2",
      [req.user.id, product_id]
    );

    if (check.rows.length > 0) {
      const newQty = check.rows[0].quantity + qty;
      await pool.query("UPDATE cart SET quantity=$1 WHERE id=$2", [
        newQty,
        check.rows[0].id,
      ]);
      return res.json({ message: "Cart diperbarui" });
    }

    const result = await pool.query(
      "INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
      [req.user.id, product_id, qty]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE CART
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (req.user.role === "admin") {
    return res.status(403).json({ message: "Admin tidak bisa mengubah keranjang" });
  }

  if (!quantity || quantity < 1)
    return res.status(400).json({ message: "Quantity minimal 1" });

  try {
    const check = await pool.query(
      "SELECT * FROM cart WHERE id=$1 AND user_id=$2",
      [id, req.user.id]
    );
    if (check.rows.length === 0)
      return res.status(404).json({ message: "Item tidak ditemukan" });

    const result = await pool.query(
      "UPDATE cart SET quantity=$1 WHERE id=$2 RETURNING *",
      [quantity, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE CART ITEM
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  if (req.user.role === "admin") {
    return res.status(403).json({ message: "Admin tidak bisa menghapus keranjang" });
  }

  try {
    const check = await pool.query(
      "SELECT * FROM cart WHERE id=$1 AND user_id=$2",
      [id, req.user.id]
    );
    if (check.rows.length === 0)
      return res.status(404).json({ message: "Item tidak ditemukan" });

    await pool.query("DELETE FROM cart WHERE id=$1", [id]);
    res.json({ message: "Item dihapus dari cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
