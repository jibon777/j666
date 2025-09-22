import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      return setMessage("❌ Password baru dan konfirmasi tidak cocok");
    }

    if (newPassword.length < 6) {
      return setMessage("❌ Password minimal 6 karakter");
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/auth/change-password",
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message || "✅ Password berhasil diubah");

      // Bersihkan input
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Redirect ke login setelah 2 detik
      setTimeout(() => {
        localStorage.removeItem("token"); // logout otomatis
        navigate("/login");
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Gagal mengubah password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Ubah Password</h2>

      {message && (
        <p
          className={`mb-4 text-center ${
            message.startsWith("✅") ? "text-green-600" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="Password Lama"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password Baru"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Konfirmasi Password Baru"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 rounded text-white ${
            isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isLoading ? "Memproses..." : "Simpan"}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-500 text-center">
        Setelah berhasil mengubah password, Anda akan diarahkan ke halaman login.
      </p>
    </div>
  );
}
