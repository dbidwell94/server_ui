import { Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Monitor from "./pages/Monitor";
import OnboardingGate from "./components/OnboardingGate";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import LoadingSpinner from "./components/LoadingSpinner";

function AppRoutes() {
  const { isLoading } = useAuth();

  // Don't render routes until auth is initialized
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />

      {/* Redirect from base path based on admin status */}
      <Route path="/" element={<OnboardingGate><Home /></OnboardingGate>} />

      {/* Routes that are public, but redirect to onboarding if no admin exists */}
      <Route
        path="/home"
        element={
          <OnboardingGate>
            <Home />
          </OnboardingGate>
        }
      />
      <Route
        path="/about"
        element={
          <OnboardingGate>
            <About />
          </OnboardingGate>
        }
      />

      {/* Routes that require full authentication */}
      <Route
        path="/monitor"
        element={
          <AuthenticatedRoute>
            <Monitor />
          </AuthenticatedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
