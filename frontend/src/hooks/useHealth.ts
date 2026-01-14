import { useEffect, useState } from "react";
import axios from "axios";

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
        const response = await axios.get("/api/health");
        const isHealthy = response.data.status === "healthy";

        setHealth({
          status: isHealthy ? "healthy" : "unhealthy",
          errors: response.data.errors || [],
          lastUpdated: new Date(),
        });
      } catch (error) {
        setHealth({
          status: "error",
          errors: [
            axios.isAxiosError(error)
              ? error.response?.status
                ? `HTTP ${error.response.status}`
                : error.message
              : "Unknown error",
          ],
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
