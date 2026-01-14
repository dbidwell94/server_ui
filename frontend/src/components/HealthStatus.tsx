import { useEffect, useState } from "react";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { statusClasses, textClasses } from "../theme";

interface HealthStatus {
  status: "healthy" | "unhealthy" | "loading" | "error";
  message: string;
  errors: string[];
  lastUpdated: Date | null;
}

export default function HealthStatus() {
  const [health, setHealth] = useState<HealthStatus>({
    status: "loading",
    message: "Checking...",
    errors: [],
    lastUpdated: null,
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("/api/health");
        if (response.ok) {
          const data = await response.json();
          const isHealthy = data.status === "healthy";
          
          setHealth({
            status: isHealthy ? "healthy" : "unhealthy",
            message: data.message || (isHealthy ? "All systems operational" : "Some systems have issues"),
            errors: data.errors || [],
            lastUpdated: new Date(),
          });
        } else {
          setHealth({
            status: "unhealthy",
            message: "Backend connection error",
            errors: [`HTTP ${response.status}`],
            lastUpdated: new Date(),
          });
        }
      } catch (error) {
        setHealth({
          status: "error",
          message: "Unable to connect to backend",
          errors: [error instanceof Error ? error.message : "Unknown error"],
          lastUpdated: new Date(),
        });
      }
    };

    // Initial check
    checkHealth();

    // Set up interval to check every 10 seconds
    const interval = setInterval(checkHealth, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusVariant = (): keyof typeof statusClasses => {
    if (health.status === "loading" || health.status === "error") {
      return "loading";
    }
    return health.status === "healthy" ? "healthy" : "unhealthy";
  };

  const getStatusIcon = () => {
    const variant = getStatusVariant();
    const iconProps = "w-5 h-5";

    if (variant === "healthy") {
      return <CheckCircleIcon className={iconProps} />;
    } else if (variant === "unhealthy") {
      return <ExclamationCircleIcon className={iconProps} />;
    } else {
      return (
        <div className={`${iconProps} rounded-full border-2 border-yellow-500 border-t-transparent animate-spin`} />
      );
    }
  };

  const isHealthy = health.status === "healthy";

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Main Status Badge */}
      <div className={statusClasses[getStatusVariant()]}>
        <div className="flex-shrink-0">
          {(() => {
            const variant = getStatusVariant();
            if (variant === "healthy") {
              return <CheckCircleIcon className="w-8 h-8" />;
            } else if (variant === "unhealthy") {
              return <ExclamationCircleIcon className="w-8 h-8" />;
            } else {
              return (
                <div className="w-8 h-8 rounded-full border-3 border-yellow-500 border-t-transparent animate-spin" />
              );
            }
          })()}
        </div>
        <div className="flex-1">
          <p className="font-bold text-xl">{health.message}</p>
          {health.lastUpdated && (
            <p className="text-sm text-gray-600 mt-1">
              Last checked: {health.lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Error List */}
      {health.errors.length > 0 && (
        <div className="mt-6 bg-red-50 border-2 border-red-300 rounded-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <ExclamationCircleIcon className="w-12 h-12 text-red-600 flex-shrink-0" />
            <p className="font-bold text-red-900 text-2xl">
              {health.errors.length === 1 ? "1 issue found" : `${health.errors.length} issues found`}
            </p>
          </div>
          <ul className="space-y-4 ml-4">
            {health.errors.map((error, index) => (
              <li key={index} className="flex items-center gap-4">
                <span className="text-red-500 font-bold text-3xl flex-shrink-0 leading-none">▸</span>
                <span className="text-base text-red-800 leading-snug">{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success State Message - Only show if there are errors to acknowledge when they're resolved */}
      {!isHealthy && health.errors.length === 0 && health.status !== "loading" && (
        <div className="mt-6 bg-green-50 border-2 border-green-300 rounded-xl p-6">
          <p className="text-base text-green-700 flex items-center gap-3 font-semibold">
            <CheckCircleIcon className="w-7 h-7" />
            Everything is working great!
          </p>
        </div>
      )}
    </div>
  );
}
