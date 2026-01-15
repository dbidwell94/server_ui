import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Onboarding from "./pages/Onboarding";
import { useHasAdmin } from "./hooks/useHasAdmin";
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
  const { hasAdmin, loading } = useHasAdmin();

  if (loading) {
    return <LoadingSpinner />;
  }

  // If no admin exists, show onboarding
  if (!hasAdmin) {
    return <Onboarding />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}

export default App;
