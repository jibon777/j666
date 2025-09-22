import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: "",
    description: "",
    price: "",
    stock: "",
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Gagal fetch produk:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Hanya angka positif, tidak boleh minus, huruf, atau karakter lain
  const handleNumberInput = (e) => {
    const { name, value } = e.target;
    // Hanya angka, tidak boleh minus, tidak boleh spasi, tidak boleh huruf
    const sanitized = value.replace(/[^0-9]/g, "");
    setForm((prev) => ({
      ...prev,
      [name]: sanitized,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.description.trim() || !form.price || form.stock === "") {
      setError("Semua field wajib diisi!");
      return;
    }

    // Validasi angka positif
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!/^\d+$/.test(form.price) || price <= 0) {
      setError("Harga harus berupa angka positif dan lebih dari 0.");
      return;
    }
    if (!/^\d+$/.test(form.stock) || stock < 0) {
      setError("Stok harus berupa angka positif atau 0.");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", price);
    formData.append("stock", stock);
    if (image) formData.append("image", image);

    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/products/${form.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await axios.post("http://localhost:5000/api/products", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setForm({ id: null, name: "", description: "", price: "", stock: "" });
      setImage(null);
      setIsEditing(false);
      fetchProducts();
      setSuccess("Produk berhasil disimpan!");
    } catch (err) {
      console.error("Gagal simpan produk:", err);
      setError("Gagal menyimpan produk. Silakan coba lagi.");
    }
  };

  const handleEdit = (product) => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
    });
    setImage(null);
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin mau hapus produk ini?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
      setSuccess("Produk berhasil dihapus!");
    } catch (err) {
      console.error("Gagal hapus produk:", err);
      setError("Gagal menghapus produk.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* Form Produk */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mb-10">
        <h3 className="text-2xl font-bold mb-6 text-indigo-700 flex items-center gap-2">
          {isEditing ? (
            <>
              <span className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm">Edit</span>
              Edit Produk
            </>
          ) : (
            <>
              <span className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-sm">Tambah</span>
              Tambah Produk
            </>
          )}
        </h3>
        {error && <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>}
        {success && <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded">{success}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nama Produk"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            <textarea
              placeholder="Deskripsi"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
              rows={3}
            />
            <div className="flex gap-4">
              <input
                type="text"
                name="price"
                placeholder="Harga"
                value={form.price}
                onChange={handleNumberInput}
                className="w-1/2 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                inputMode="numeric"
                pattern="[0-9]*"
                min="1"
                autoComplete="off"
              />
              <input
                type="text"
                name="stock"
                placeholder="Stok"
                value={form.stock}
                onChange={handleNumberInput}
                className="w-1/2 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                inputMode="numeric"
                pattern="[0-9]*"
                min="0"
                autoComplete="off"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>
          <div className="flex flex-col justify-between gap-4">
            <button
              type="submit"
              className={`w-full py-3 rounded-lg text-white font-semibold transition ${
                isEditing
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isEditing ? "Update Produk" : "Tambah Produk"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setForm({ id: null, name: "", description: "", price: "", stock: "" });
                  setImage(null);
                  setError("");
                  setSuccess("");
                }}
                className="w-full py-3 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold transition"
              >
                Batal Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List Produk */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h3 className="text-2xl font-bold mb-6 text-indigo-700">Daftar Produk</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="border rounded-xl p-4 flex flex-col shadow hover:shadow-lg transition">
              <div className="flex items-center gap-4 mb-4">
                {p.image_url ? (
                  <img
                    src={`http://localhost:5000${p.image_url}`}
                    alt={p.name}
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-lg text-gray-400">
                    No Image
                  </div>
                )}
                <div>
                  <p className="font-bold text-lg">{p.name}</p>
                  <p className="text-gray-600 text-sm">{p.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                      Harga: Rp {Number(p.price).toLocaleString("id-ID")}
                    </span>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${p.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      Stok: {p.stock}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
        {products.length === 0 && (
          <div className="text-center text-gray-500 py-8">Belum ada produk.</div>
        )}
      </div>
    </div>
  );
}