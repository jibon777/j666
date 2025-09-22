# 🚀 Project Starter Guide

Selamat datang di project ini! 🎉
Ikuti langkah-langkah di bawah ini agar project dapat berjalan dengan lancar.

---

## ✅ Prasyarat

Sebelum memulai, pastikan sudah menginstall:

1. **Docker**
   Untuk menjalankan database dan service container.
   [Install Docker](https://www.docker.com/get-started)

2. **Node.js**
   Untuk menjalankan backend dan frontend.
   [Install Node.js](https://nodejs.org/)

3. **React.js**
   Framework untuk frontend project ini.

---

## ⚡ Menjalankan Project

### 1️⃣ Jalankan Database
Gunakan Docker Compose untuk menjalankan database:
```bash
docker compose up -d

### 1️⃣ Jalankan backend
cd backend
npm install
npm start


### 1️⃣ Jalankan frontend
cd frontend
npm install
npm run dev


### 1️⃣ tambahan
**menghentikan database**
docker compose down
