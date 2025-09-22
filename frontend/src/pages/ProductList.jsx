// src/pages/ProductList.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import api from "../api"; // axios instance

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [addingProductId, setAddingProductId] = useState(null);

  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // ambil kategori unik dari produk
  const categories = ["all", ...new Set(products.map((p) => p.category).filter(Boolean))];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products"); // pakai instance api
      setProducts(res.data);
    } catch (err) {
      console.error("Gagal fetch produk:", err);
      setError("Gagal memuat daftar produk");
      toast.error("Gagal memuat daftar produk");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          (p.category && p.category.toLowerCase().includes(term))
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "stock":
        result.sort((a, b) => b.stock - a.stock);
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [products, searchTerm, categoryFilter, sortBy]);

  const addToCart = async (product) => {
    if (!token) {
      toast.info("Silakan login untuk menambahkan ke keranjang");
      navigate("/login");
      return;
    }

    if (role === "admin") {
      toast.warning("Admin tidak bisa menambahkan produk ke keranjang!");
      return;
    }

    if (product.stock < 1) {
      toast.warning("Stok produk habis");
      return;
    }

    setAddingProductId(product.id);
    try {
      await api.post("/cart", { product_id: product.id, quantity: 1 });
      toast.success(`${product.name} ditambahkan ke keranjang`);
    } catch (err) {
      console.error("Error addToCart:", err);
      toast.error(err.response?.data?.error || "Gagal menambahkan ke keranjang");
    } finally {
      setAddingProductId(null);
    }
  };

  if (loading) return <p className="p-6">Loading produk...</p>;
  if (error)
    return (
      <div className="p-6 text-red-500">
        {error} <button onClick={fetchProducts}>Coba Lagi</button>
      </div>
    );

  return (
    <section className="bg-gray-100 px-6 py-16 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-center mb-12">Produk Kami</h3>

        {/* Filter dan Sorting */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-white rounded-lg shadow-sm">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">Semua Kategori</option>
            {categories
              .filter((c) => c !== "all")
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="name">Urutkan: Nama</option>
            <option value="price-low">Harga Terendah</option>
            <option value="price-high">Harga Tertinggi</option>
            <option value="stock">Stok Terbanyak</option>
          </select>
        </div>

        {/* Produk */}
        {filteredProducts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-md flex flex-col"
              >
                {/* Gambar Produk */}
                <div className="h-48 bg-gray-200 overflow-hidden flex items-center justify-center">
                  <img
                    src={`http://localhost:5000${p.image_url}`}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/no-image.png";
                    }}
                  />
                </div>

                {/* Info Produk */}
                <div className="p-4 flex-1 flex flex-col">
                  <h4 className="text-lg font-semibold mb-2">{p.name}</h4>
                  {p.category && (
                    <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full mb-2 self-start">
                      {p.category}
                    </span>
                  )}
                  <p className="text-gray-600 text-sm mb-4 flex-1">{p.description}</p>

                  <div className="mb-3">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        p.stock > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {p.stock > 0 ? `Stok: ${p.stock}` : "Stok Habis"}
                    </span>
                  </div>

                  <p className="text-indigo-600 font-bold text-lg mb-4">
                    Rp {Number(p.price).toLocaleString("id-ID")}
                  </p>

                  {/* Tombol */}
                  <div className="mt-auto space-y-2">
                    <Link
                      to={`/product/${p.id}`}
                      className="block w-full bg-indigo-600 text-white text-center py-2 rounded-lg hover:bg-indigo-700"
                    >
                      Detail
                    </Link>

                    {(role === "user" || !token) && p.stock > 0 && (
                      <button
                        onClick={() => addToCart(p)}
                        disabled={addingProductId === p.id}
                        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 flex items-center justify-center disabled:bg-gray-400"
                      >
                        {addingProductId === p.id ? "..." : "+ Keranjang"}
                      </button>
                    )}

                    {p.stock === 0 && (
                      <button
                        disabled
                        className="w-full bg-gray-400 text-white py-2 rounded-lg cursor-not-allowed"
                      >
                        Stok Habis
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">Tidak ada produk ditemukan</p>
        )}
      </div>
    </section>
  );
}
