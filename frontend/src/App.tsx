import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthenticatedRoute from "./components/AuthenticatedRoute";

function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />

      {/* Redirect from base path based on admin status */}
      <Route path="/" element={<ProtectedRoute />} />

      {/* Protected routes - require admin to exist */}
      <Route
        path="/home"
        element={
          <AuthenticatedRoute>
            <Home />
          </AuthenticatedRoute>
        }
      />
      <Route
        path="/about"
        element={
          <AuthenticatedRoute>
            <About />
          </AuthenticatedRoute>
        }
      />
    </Routes>
  );
}

export default App;
