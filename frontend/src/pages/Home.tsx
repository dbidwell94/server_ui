import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import HealthStatus from "../components/HealthStatus";

export default function Home() {
  return (
    <PageLayout showFooter>
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
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
    </PageLayout>
  );
}
