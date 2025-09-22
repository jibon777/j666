// src/pages/UserDashboard.jsx
import React, { useState, useEffect } from "react";
import { FiUser, FiSettings, FiLogOut, FiSun, FiMoon } from "react-icons/fi";

export default function UserDashboard() {
  const [username, setUsername] = useState("User");
  const [role, setRole] = useState("user");
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Mengambil data dari localStorage
    const storedUsername = localStorage.getItem("username") || "User";
    const storedRole = localStorage.getItem("role") || "user";
    const storedDarkMode = localStorage.getItem("darkMode") === "true";
    
    setUsername(storedUsername);
    setRole(storedRole);
    setDarkMode(storedDarkMode);
    
    // Terapkan mode gelap jika diperlukan
    if (storedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    // Logika logout
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Header */}
      <header className={`px-6 py-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Dashboard</h1>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
            >
              {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white font-bold mr-2`}>
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block">{username}</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} flex items-center`}
            >
              <FiLogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className={`px-6 py-3 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex space-x-4">
          <button 
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg ${activeTab === "overview" 
              ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700') 
              : (darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800')
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-lg ${activeTab === "profile" 
              ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700') 
              : (darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800')
            }`}
          >
            Profile
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-lg ${activeTab === "settings" 
              ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700') 
              : (darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800')
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className={`p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-2xl font-bold mb-2">Selamat datang, {username}! 🎉</h2>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                Role kamu: <span className="font-semibold capitalize">{role}</span>
              </p>
              <p className="mt-3">
                Mulai jelajahi dashboard dan kelola akun Anda. 
                Gunakan menu di atas untuk berpindah antara section overview, profile, dan settings.
              </p>
            </div>

            {/* Quick Actions */}
            <div className={`p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="text-xl font-semibold mb-4">Aksi Cepat</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => setActiveTab("profile")}
                  className={`p-4 rounded-lg flex items-center ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <FiUser className="w-5 h-5 mr-3" />
                  Edit Profile
                </button>
                <button 
                  onClick={() => setActiveTab("settings")}
                  className={`p-4 rounded-lg flex items-center ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <FiSettings className="w-5 h-5 mr-3" />
                  Pengaturan
                </button>
              </div>
            </div>

            {/* Status */}
            <div className={`p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="text-xl font-semibold mb-4">Status Akun</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Aktif</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Bergabung sejak</span>
                  <span>{new Date().toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className={`p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
            
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                  {username.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nama Pengguna
                    </label>
                    <input 
                      type="text" 
                      className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      defaultValue={username}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Role
                    </label>
                    <input 
                      type="text" 
                      className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-300'} border capitalize cursor-not-allowed`}
                      defaultValue={role}
                      disabled
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <input 
                    type="email" 
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="email@example.com"
                  />
                </div>
                
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className={`p-6 rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold mb-6">Pengaturan</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Tampilan</h3>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
                  <span>Mode Gelap</span>
                  <button 
                    onClick={toggleDarkMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Bahasa</h3>
                <select className={`w-full p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'} border focus:ring-2 focus:ring-blue-500 focus:border-transparent`}>
                  <option>Indonesia</option>
                  <option>English</option>
                </select>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Notifikasi</h3>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                    <span className="ml-2">Email notifikasi</span>
                  </label>
                </div>
              </div>
              
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                Simpan Pengaturan
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}