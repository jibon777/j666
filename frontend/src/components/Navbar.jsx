import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, cartCount, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    if (onLogout) onLogout(); // reset state di App.jsx
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          MyBrand
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-indigo-600">Home</Link>
          <Link to="/about" className="text-gray-700 hover:text-indigo-600">About</Link>
          <Link to="/products" className="text-gray-700 hover:text-indigo-600">Products</Link>
          <Link to="/contact" className="text-gray-700 hover:text-indigo-600">Contact</Link>

          {user.role ? (
            <div className="flex items-center space-x-4">
              {user.role === "user" && (
                <>
                  <Link to="/cart" className="relative text-gray-700 hover:text-indigo-600">
                    Cart
                    {cartCount > 0 && (
                      <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <div className="relative group">
                    <button className="text-gray-700 hover:text-indigo-600 focus:outline-none">
                      {user.name} ▼
                    </button>
                    <div className="absolute right-0 w-48 mt-2 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                      <Link to="/user-dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100">Profile</Link>
                      <Link to="/change-password" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100">Change Password</Link>
                      <button onClick={handleLogoutClick} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100">Logout</button>
                    </div>
                  </div>
                </>
              )}

              {user.role === "admin" && (
                <div className="relative group">
                  <button className="text-gray-700 hover:text-indigo-600 focus:outline-none">
                    {user.name} ▼
                  </button>
                  <div className="absolute right-0 w-48 mt-2 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                    <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100">Dashboard</Link>
                    <Link to="/change-password" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100">Change Password</Link>
                    <button onClick={handleLogoutClick} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100">Logout</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="text-gray-700 hover:text-indigo-600">Login</Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-700 focus:outline-none"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <Link to="/" className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 rounded">Home</Link>
          <Link to="/about" className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 rounded">About</Link>
          <Link to="/products" className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 rounded">Products</Link>
          <Link to="/contact" className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 rounded">Contact</Link>

          {user.role ? (
            <>
              {user.role === "user" && (
                <>
                  <Link to="/cart" className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 rounded">Cart</Link>
                  <Link to="/user-dashboard" className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 rounded">Profile</Link>
                  <Link to="/change-password" className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 rounded">Change Password</Link>
                  <button onClick={handleLogoutClick} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-100 rounded">Logout</button>
                </>
              )}
              {user.role === "admin" && (
                <>
                  <Link to="/admin" className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 rounded">Dashboard</Link>
                  <Link to="/change-password" className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 rounded">Change Password</Link>
                  <button onClick={handleLogoutClick} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-100 rounded">Logout</button>
                </>
              )}
            </>
          ) : (
            <Link to="/login" className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 rounded">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}
