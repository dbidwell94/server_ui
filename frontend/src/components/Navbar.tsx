import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useHealth } from "../hooks/useHealth";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const health = useHealth();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setIsClosing(false);
  };

  const closeMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 150);
  };

  const handleLogout = async () => {
    try {
      await api.post('/user/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    }
    logout();
    closeMenu();
    navigate("/login");
  };

  const getStatusColor = () => {
    if (health.status === "healthy") return "bg-green-500";
    if (health.status === "unhealthy") return "bg-red-500";
    if (health.status === "error") return "bg-red-500";
    return "bg-yellow-500";
  };

  const getStatusPulse = () => {
    return "animate-pulse";
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with Status Indicator */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${getStatusColor()} ${getStatusPulse()}`} />
                <h1 className="text-2xl font-bold text-gray-900">Server UI</h1>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/about"
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                About
              </Link>
              {isAuthenticated && user ? (
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 font-medium">{user.username}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                {isOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {isOpen && (
        <div
          className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-xl z-50 md:hidden ${
            isClosing ? "animate-slide-out" : "animate-slide-in"
          }`}
        >
          <div className="p-6">
            {/* Close Button */}
            <button
              onClick={closeMenu}
              className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6 text-gray-700" />
            </button>

            {/* Menu Items */}
            <div className="mt-8 space-y-4">
              <Link
                to="/about"
                className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition"
                onClick={closeMenu}
              >
                About
              </Link>
              {isAuthenticated && user ? (
                <div className="space-y-4">
                  <div className="px-4 py-3 text-gray-700 font-medium">
                    Signed in as: {user.username}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="block w-full text-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                  onClick={closeMenu}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
