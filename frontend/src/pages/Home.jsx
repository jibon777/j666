// src/pages/Home.jsx
import { motion } from "framer-motion";

export default function Home() {
  return (
    <section className="max-w-screen-xl mx-auto px-6 py-16 text-center">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-6xl font-bold text-gray-800"
      >
        Welcome to <span className="text-blue-600">MyBrand</span>
      </motion.h1>
      <p className="mt-6 text-lg text-gray-600">
        Modern website built with React + Tailwind + Framer Motion ✨
      </p>
    </section>
  );
}
