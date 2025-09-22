// src/pages/Contact.jsx
export default function Contact() {
  return (
    <section className="max-w-screen-md mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Contact Us</h2>
      <form className="bg-white p-6 shadow-md rounded-xl space-y-4">
        <input type="text" placeholder="Your Name" className="w-full border rounded-lg p-3" />
        <input type="email" placeholder="Your Email" className="w-full border rounded-lg p-3" />
        <textarea placeholder="Your Message" rows="4" className="w-full border rounded-lg p-3"></textarea>
        <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition">
          Send Message
        </button>
      </form>
    </section>
  );
}