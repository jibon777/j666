import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", {
        username
      });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Lupa Password</h2>
      <p className="text-gray-600 mb-4 text-center">
        Masukkan username Anda untuk menerima link reset password
      </p>

      {message && <p className="text-green-500 mb-3 text-center">{message}</p>}
      {error && <p className="text-red-500 mb-3 text-center">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading}
        >
          {isLoading ? "Memproses..." : "Kirim Link Reset"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link to="/login" className="text-blue-500 hover:text-blue-700 text-sm">
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
}
