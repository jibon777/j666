// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ChangePassword";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import UserDashboard from "./pages/UserDashboard";
import FloatingWA from "./components/FloatingWA"; // tombol WA

export default function App() {
  const [user, setUser] = useState({ role: null, name: null });
  const [cartCount, setCartCount] = useState(0);

  // Ambil data user dari localStorage saat pertama kali load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username"); // sesuai yg disimpan login
    if (token && role && username) {
      setUser({ role, name: username });
    }
  }, []);

  // Fungsi dipanggil saat login berhasil
  const handleLoginSuccess = (role, username) => {
    setUser({ role, name: username });
  };

  // Fungsi logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    setUser({ role: null, name: null }); // reset state
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col relative">
        <Navbar cartCount={cartCount} user={user} onLogout={handleLogout} />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/login"
              element={<Login onLoginSuccess={handleLoginSuccess} />}
            />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart setCartCount={setCartCount} />} />

            {/* Dashboard Admin */}
            <Route
              path="/admin"
              element={
                user.role === "admin" ? <Admin /> : <Navigate to="/login" replace />
              }
            />

            {/* Dashboard User */}
            <Route
              path="/user-dashboard"
              element={
                user.role === "user"
                  ? <UserDashboard />
                  : <Navigate to="/login" replace />
              }
            />

            {/* Redirect jika path tidak ditemukan */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
        <FloatingWA />
      </div>
    </Router>
  );
}
