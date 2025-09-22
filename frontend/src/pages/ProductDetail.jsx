// src/pages/ProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";

export default function ProductDetail({ setCartCount }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isLoggedIn = () => !!localStorage.getItem("token");

  // --- ambil data produk
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Produk tidak ditemukan");
        toast.error("Gagal memuat detail produk");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // --- validasi sebelum menambahkan ke keranjang
  const validateAddToCart = () => {
    // Cek stok terlebih dahulu
    if (product.stock === 0) {
      toast.warning("Stok produk habis");
      return false;
    }
    
    // Kemudian cek status available (jika properti ini ada)
    if (product.hasOwnProperty('available') && !product.available) {
      toast.warning("Produk sedang tidak tersedia");
      return false;
    }
    
    if (quantity <= 0) {
      toast.warning("Jumlah produk harus lebih dari 0");
      return false;
    }
    
    if (quantity > product.stock) {
      toast.warning(`Jumlah melebihi stok. Stok tersedia: ${product.stock}`);
      return false;
    }
    
    return true;
  };

  // --- tambah/update keranjang
  const performAddToCart = async () => {
    if (!validateAddToCart()) {
      return false;
    }

    setIsProcessing(true);
    try {
      const { data: currentCart } = await api.get("/cart");

      const alreadyInCart = currentCart.find(
        (item) => item.product_id === product.id
      );

      if (alreadyInCart) {
        const newQuantity = alreadyInCart.quantity + quantity;
        
        // Validasi jika jumlah baru melebihi stok
        if (newQuantity > product.stock) {
          toast.warning(`Total jumlah produk di keranjang melebihi stok. Stok tersedia: ${product.stock}`);
          return false;
        }
        
        // update qty
        await api.put(`/cart/${alreadyInCart.id}`, {
          quantity: newQuantity,
        });
      } else {
        // insert baru
        await api.post("/cart", { product_id: product.id, quantity });
      }

      // refresh cart count
      const res = await api.get("/cart");
      if (setCartCount) setCartCount(res.data.length);

      return true;
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error(err.response?.data?.error || "Gagal menambahkan ke keranjang");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // --- button tambah keranjang (DIUBAH)
  const handleAddToCart = async () => {
    if (!isLoggedIn()) {
      toast.info("Silakan login untuk menambahkan ke keranjang");
      navigate("/login", { state: { from: location } });
      return;
    }
    
    const result = await performAddToCart();
    if (result === true) {
      toast.success("✅ Produk berhasil ditambahkan ke keranjang!");
      setQuantity(1);
      
      // TAMBAHKAN INI: Redirect ke cart dengan parameter
      navigate(`/cart?newProduct=${encodeURIComponent(product.name)}`);
    }
  };

  // --- button beli sekarang (akan redirect ke cart dengan parameter)
  const handleBuyNow = async () => {
    if (!isLoggedIn()) {
      toast.info("Silakan login untuk melanjutkan");
      navigate("/login", { state: { from: location } });
      return;
    }
    
    // Validasi sebelum melanjutkan ke pembelian
    if (!validateAddToCart()) {
      return;
    }
    
    const result = await performAddToCart();
    if (result === true) {
      // Redirect ke cart dengan parameter produk baru
      navigate(`/cart?newProduct=${encodeURIComponent(product.name)}`);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!product) return <p className="p-6 text-red-500">Produk tidak ditemukan</p>;

  // Perbaikan logika ketersediaan produk
  const isOutOfStock = product.stock === 0;
  
  // Cek apakah produk memiliki properti 'available'
  // Jika tidak, asumsikan produk tersedia selama stok > 0
  const hasAvailableProperty = product.hasOwnProperty('available');
  const isAvailable = hasAvailableProperty ? product.available && !isOutOfStock : !isOutOfStock;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <nav className="mb-6 text-sm">
        <Link to="/" className="text-indigo-600 hover:underline">Beranda</Link>
        <span className="mx-2">/</span>
        <Link to="/product" className="text-indigo-600 hover:underline">Produk</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600 truncate">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* gambar produk */}
        <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center h-72 md:h-96">
          {product.image_url && !imageError ? (
            <img
              src={`http://localhost:5000${product.image_url}`}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-gray-500">Gambar Tidak Tersedia</span>
          )}
        </div>

        {/* detail produk */}
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
            <p className="text-gray-600 mb-5">{product.description}</p>
            <p className="text-2xl font-bold text-indigo-600 mb-2">
              Rp {product.price?.toLocaleString()}
            </p>
            
            {/* Status stok */}
            <div className="mb-4">
              {isOutOfStock ? (
                <p className="text-red-500 font-semibold">Stok Habis</p>
              ) : (
                <p className="text-green-600 font-semibold">
                  Stok Tersedia: {product.stock}
                </p>
              )}
              
              {hasAvailableProperty && !product.available && (
                <p className="text-red-500 text-sm mt-1">
                  Produk saat ini tidak tersedia untuk dijual
                </p>
              )}
            </div>

            {/* qty control - hanya tampil jika produk available */}
            {isAvailable && (
              <div className="flex items-center gap-3 mb-6">
                <label htmlFor="quantity" className="font-medium">Jumlah:</label>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
                  disabled={quantity <= 1}
                >-</button>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, Math.min(product.stock, value)));
                  }}
                  className="w-16 text-center border rounded py-1"
                />
                <button
                  onClick={() => {
                    if (quantity < product.stock) setQuantity(quantity + 1);
                    else toast.warning(`Stok hanya tersedia ${product.stock}`);
                  }}
                  disabled={quantity >= product.stock}
                  className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
                >+</button>
              </div>
            )}
          </div>

          {/* action button */}
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={isProcessing || !isAvailable}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Memproses..." : 
               !isAvailable ? "Produk Tidak Tersedia" : "Tambah ke Keranjang"}
            </button>
            
            {isAvailable && (
              <button
                onClick={handleBuyNow}
                disabled={isProcessing}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Memproses..." : "Beli Sekarang"}
              </button>
            )}
          </div>
          
          {/* Pesan untuk produk tidak tersedia */}
          {!isAvailable && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded text-yellow-800">
              <p className="font-medium">Produk ini saat ini tidak dapat dibeli.</p>
              {isOutOfStock ? (
                <p className="text-sm">Stok produk sedang habis.</p>
              ) : (
                <p className="text-sm">Produk tidak tersedia untuk dijual.</p>
              )}
              <p className="text-sm">Silakan hubungi kami jika membutuhkan bantuan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}