import { useEffect, useState } from "react";

interface HealthData {
  status: "healthy" | "unhealthy" | "loading" | "error";
  errors: string[];
  lastUpdated: Date | null;
}

export function useHealth() {
  const [health, setHealth] = useState<HealthData>({
    status: "loading",
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
            errors: data.errors || [],
            lastUpdated: new Date(),
          });
        } else {
          setHealth({
            status: "unhealthy",
            errors: [`HTTP ${response.status}`],
            lastUpdated: new Date(),
          });
        }
      } catch (error) {
        setHealth({
          status: "error",
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

  return health;
}
