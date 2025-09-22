// src/pages/Cart.jsx
import React, { useEffect, useState } from "react";
import api from "../api";

export default function Cart({ setCartCount }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "" });

  // Tampilkan notifikasi sementara
  const showNotification = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => {
      setNotification({ show: false, message: "" });
    }, 3000); // Notifikasi hilang setelah 3 detik
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get("/cart");
      setItems(res.data);
      if (setCartCount) setCartCount(res.data.length);
      
      // Cek jika ada parameter produk baru di URL
      const urlParams = new URLSearchParams(window.location.search);
      const newProduct = urlParams.get('newProduct');
      if (newProduct) {
        showNotification(`Produk "${newProduct}" berhasil ditambahkan ke keranjang!`);
        // Hapus parameter dari URL tanpa refresh halaman
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err) {
      setError("Gagal mengambil data keranjang");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      // Optimistic update: langsung update UI tanpa menunggu response
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
      
      await api.put(`/cart/${id}`, { quantity: newQuantity });
      
      // Refresh data untuk memastikan sinkronisasi dengan backend
      fetchCart();
    } catch (err) {
      console.error("Gagal update jumlah:", err);
      // Jika gagal, kembalikan ke state sebelumnya
      fetchCart();
    }
  };

  const removeItem = async (id) => {
    try {
      // Optimistic update: langsung hapus dari UI tanpa menunggu response
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      if (setCartCount) setCartCount(prev => prev - 1);
      
      await api.delete(`/cart/${id}`);
      
      // Refresh data untuk memastikan sinkronisasi dengan backend
      fetchCart();
      showNotification("Produk berhasil dihapus dari keranjang!");
    } catch (err) {
      console.error("Gagal hapus item:", err);
      // Jika gagal, kembalikan ke state sebelumnya
      fetchCart();
    }
  };

  if (loading) return <p className="p-6">Loading keranjang...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Notifikasi */}
      {notification.show && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn">
          {notification.message}
        </div>
      )}
      
      <h2 className="text-2xl font-bold mb-6">🛒 Keranjang Belanja</h2>
      {items.length === 0 ? (
        <p className="text-gray-600">Keranjang masih kosong.</p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <CartItem 
                key={item.id} 
                item={item} 
                onUpdate={updateQuantity} 
                onRemove={removeItem} 
              />
            ))}
          </div>
          <div className="mt-6 bg-gray-100 p-4 rounded-lg flex justify-between items-center">
            <h3 className="text-xl font-bold">Total:</h3>
            <span className="text-xl font-bold text-indigo-600">Rp {total.toLocaleString('id-ID')}</span>
          </div>
          <div className="mt-4 text-right">
            <button 
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
              onClick={(e) => {
                e.preventDefault(); // Mencegah refresh halaman
                alert("Proses checkout akan dilakukan!");
              }}
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CartItem({ item, onUpdate, onRemove }) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleUpdate = async (newQuantity) => {
    if (newQuantity === item.quantity) return;
    
    setIsUpdating(true);
    try {
      await onUpdate(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await onRemove(item.id);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`flex items-center justify-between bg-white shadow p-4 rounded-lg gap-4 ${isUpdating ? 'opacity-70' : ''}`}>
      <img 
        src={`http://localhost:5000${item.image_url}`} 
        alt={item.name} 
        className="w-20 h-20 object-cover rounded"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/80x80?text=Gambar+Tidak+Tersedia';
        }}
      />
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{item.name}</h3>
        <p className="text-gray-600">Rp {item.price.toLocaleString('id-ID')} / item</p>
        <p className="text-sm text-gray-500">Stok tersedia: {item.stock}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center border rounded-lg">
          <button 
            onClick={() => handleUpdate(item.quantity - 1)} 
            disabled={item.quantity <= 1 || isUpdating} 
            className={`px-3 py-1 ${item.quantity <= 1 || isUpdating ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-200"}`}
          >
            -
          </button>
          <span className="px-4">{item.quantity}</span>
          <button 
            onClick={() => handleUpdate(item.quantity + 1)} 
            disabled={item.quantity >= item.stock || isUpdating} 
            className={`px-3 py-1 ${item.quantity >= item.stock || isUpdating ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-200"}`}
          >
            +
          </button>
        </div>
        <span className="font-bold text-indigo-600 w-28 text-right">
          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
        </span>
        <button 
          onClick={handleRemove} 
          disabled={isUpdating}
          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition disabled:bg-red-300 disabled:cursor-not-allowed"
        >
          {isUpdating ? "..." : "Hapus"}
        </button>
      </div>
    </div>
  );
}