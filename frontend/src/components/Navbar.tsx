import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useHealth } from "../hooks/useHealth";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../lib/api";
import UserDropdown from "./UserDropdown";
import { result } from "@dbidwell94/ts-utils";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    const res = await result.fromPromise(apiClient.post("/user/logout"));
    if (res.isError()) {
      console.error("Logout request failed:", res.error);
    }
    logout();
    setIsDropdownOpen(false);
    closeMenu();
    navigate("/home");
  };

  const getStatusColor = () => {
    switch (health.status) {
      case "healthy":
        return "bg-green-500";
      case "unhealthy":
      case "error":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  return (
    <>
      <nav className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with Status Indicator */}
            <Link to="/" className="shrink-0 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}
                />
                <h1 className="text-2xl font-bold text-white">Deliverance</h1>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/about"
                className="text-gray-300 hover:text-white font-medium transition"
              >
                About
              </Link>
              {isAuthenticated && user ? (
                <>
                  <Link
                    to="/run-game"
                    className="text-gray-300 hover:text-white font-medium transition"
                  >
                    Run Game
                  </Link>
                  <UserDropdown
                    user={user}
                    isOpen={isDropdownOpen}
                    onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
                    onLogout={handleLogout}
                  />
                </>
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
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:bg-slate-800"
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
          className={`fixed top-0 left-0 h-screen w-64 bg-slate-900 shadow-xl z-50 md:hidden ${
            isClosing ? "animate-slide-out" : "animate-slide-in"
          }`}
        >
          <div className="p-6">
            {/* Close Button */}
            <button
              onClick={closeMenu}
              className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6 text-gray-300" />
            </button>

            {/* Menu Items */}
            <div className="mt-8 space-y-4">
              <Link
                to="/about"
                className="block px-4 py-3 text-gray-300 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition"
                onClick={closeMenu}
              >
                About
              </Link>
              {isAuthenticated && user ? (
                <div className="space-y-4">
                  <div className="px-4 py-3 text-gray-300 font-medium">
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
