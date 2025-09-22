import React from "react";
import { FaWhatsapp } from "react-icons/fa";

export default function FloatingWA() {
  const phoneNumber = "628979630624"; // ganti dengan nomor WA kamu
  const message = "Halo, saya mau tanya tentang produk Anda"; 

  const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all z-50"
    >
      <FaWhatsapp size={28} />
    </a>
  );
}
