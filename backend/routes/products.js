import express from "express";
import pool from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

const router = express.Router();

// === Validasi harga dan stok ===
function validatePrice(price) {
  return Number.isInteger(price) && price > 0;
}
function validateStock(stock) {
  return Number.isInteger(stock) && stock >= 0;
}

// === Konfigurasi multer ===
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Hanya boleh upload file gambar (jpg, jpeg, png, webp)"));
    }
  },
});

// === GET semua produk ===
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error get all produk:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// === GET produk by ID ===
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error get produk:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// === POST tambah produk ===
router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    const { name, description, price, stock } = req.body;
    let imageUrl = null;

    // Kompres gambar jika ada file
    if (req.file) {
      const inputPath = req.file.path;
      const outputPath = `${uploadDir}/compressed-${req.file.filename}`;
      await sharp(inputPath)
        .resize({ width: 800 }) // resize max width 800px
        .jpeg({ quality: 70 }) // kompres kualitas 70%
        .toFile(outputPath);

      fs.unlinkSync(inputPath); // hapus file asli
      imageUrl = `/uploads/compressed-${req.file.filename}`;
    }

    if (!name || !description || price === undefined || stock === undefined) {
      return res.status(400).json({ error: "Semua field wajib diisi (name, description, price, stock)" });
    }

    if (!validatePrice(Number(price))) {
      return res.status(400).json({ error: "Harga harus angka bulat positif" });
    }

    if (!validateStock(Number(stock))) {
      return res.status(400).json({ error: "Stok harus angka bulat positif atau nol" });
    }

    const result = await pool.query(
      "INSERT INTO products (name, description, price, stock, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name.trim(), description.trim(), Number(price), Number(stock), imageUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// === PUT update produk ===
router.put("/:id", upload.single("image"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;
    let imageUrl = null;

    if (req.file) {
      const inputPath = req.file.path;
      const outputPath = `${uploadDir}/compressed-${req.file.filename}`;
      await sharp(inputPath)
        .resize({ width: 800 })
        .jpeg({ quality: 70 })
        .toFile(outputPath);

      fs.unlinkSync(inputPath);
      imageUrl = `/uploads/compressed-${req.file.filename}`;
    }

    if (!name || !description || price === undefined || stock === undefined) {
      return res.status(400).json({ error: "Semua field wajib diisi" });
    }

    if (!validatePrice(Number(price))) {
      return res.status(400).json({ error: "Harga harus angka bulat positif" });
    }

    if (!validateStock(Number(stock))) {
      return res.status(400).json({ error: "Stok harus angka bulat positif atau nol" });
    }

    // ambil produk lama
    const existing = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    const oldImage = existing.rows[0].image_url;

    let query = `
      UPDATE products 
      SET name=$1, description=$2, price=$3, stock=$4 ${imageUrl ? ", image_url=$5" : ""} 
      WHERE id=$${imageUrl ? 6 : 5} RETURNING *`;

    const values = imageUrl
      ? [name.trim(), description.trim(), Number(price), Number(stock), imageUrl, id]
      : [name.trim(), description.trim(), Number(price), Number(stock), id];

    const result = await pool.query(query, values);

    // hapus file lama jika ada gambar baru
    if (imageUrl && oldImage) {
      const oldPath = path.join("uploads", path.basename(oldImage));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// === DELETE produk ===
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    const oldImage = existing.rows[0].image_url;

    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);

    // hapus file gambar lama
    if (oldImage) {
      const oldPath = path.join("uploads", path.basename(oldImage));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    res.json({ message: "Produk berhasil dihapus" });
  } catch (err) {
    console.error("Error delete produk:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// === Error handler khusus multer & sharp ===
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Ukuran gambar maksimal 2MB" });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

export default router;