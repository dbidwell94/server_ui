import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import Card from "../components/Card";

export default function About() {
  return (
    <PageLayout showFooter>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">About</h1>
          <p className="text-gray-600 mb-6">
            Server UI is a modern web interface for managing headless Steam servers. Monitor server health, view real-time logs, and execute commands remotely with an intuitive dashboard.
          </p>
          <div className="mb-6">
            <p className="text-sm text-gray-500">
              Built with Rust & Rocket backend, React & TypeScript frontend, Vite, Tailwind CSS, and React Router.
            </p>
          </div>
          <Link
            to="/"
            className="block w-full text-center font-semibold py-2 px-4 rounded transition duration-200 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Back to Home
          </Link>
        </Card>
      </div>
    </PageLayout>
  );
}
