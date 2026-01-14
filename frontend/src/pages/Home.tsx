import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import HealthStatus from "../components/HealthStatus";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 text-white flex flex-col items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Seamlessly manage your headless Steam server
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12">
            Monitor and control your server remotely with a modern web interface
          </p>

          {/* Health Status */}
          <div className="flex justify-center mb-12">
            <HealthStatus />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/about"
              className="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2026 Server UI. Built with Rust and React.</p>
        </div>
      </footer>
    </div>
  );
}
