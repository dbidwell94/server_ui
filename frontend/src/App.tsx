import { Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRequiredRoute from "./components/AdminRequiredRoute";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          {/* Public auth routes */}
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />

          {/* Redirect from base path based on admin status */}
          <Route path="/" element={<ProtectedRoute />} />

          {/* Routes that require admin to exist, but not authentication */}
          <Route
            path="/home"
            element={
              <AdminRequiredRoute>
                <Home />
              </AdminRequiredRoute>
            }
          />
          <Route
            path="/about"
            element={
              <AdminRequiredRoute>
                <About />
              </AdminRequiredRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
