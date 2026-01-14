import { Routes, Route, Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Server UI</h1>
        <p className="text-gray-600 mb-6">
          Seamlessly manage your headless Steam server remotely
        </p>
        <div className="space-y-4">
          <Link
            to="/about"
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
          >
            About
          </Link>
          <a
            href="/api/health"
            className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
          >
            Check API Health
          </a>
        </div>
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">About</h1>
        <p className="text-gray-600 mb-6">
          This is a demo of a Rust + Rocket backend serving a React SPA with
          TypeScript, Vite, Tailwind CSS, and React Router.
        </p>
        <Link
          to="/"
          className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}

export default App;
