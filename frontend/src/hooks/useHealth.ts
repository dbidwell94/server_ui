import { useQuery } from "@tanstack/react-query";
import apiClient from "../lib/api";
import { result } from "@dbidwell94/ts-utils";

interface HealthData {
  status: "healthy" | "unhealthy";
  errors: string[];
}

interface HealthResponse {
  status: "healthy" | "unhealthy" | "loading" | "error";
  errors: string[];
  lastUpdated: Date | null;
}

export function useHealth(): HealthResponse {
  const { data } = useQuery<HealthResponse>({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await result.fromPromise(
        apiClient.get<HealthData>("/health"),
      );

      if (response.isError()) {
        return {
          status: "error",
          errors: ["Failed to fetch health data."],
          lastUpdated: null,
        };
      } else {
        return { ...response.value.data, lastUpdated: new Date() };
      }
    },
    refetchInterval: 10_000, // 10 seconds
    initialData: {
      status: "loading",
      errors: [],
      lastUpdated: null,
    },
    initialDataUpdatedAt: 0,
    retry: false,
  });

  return data;
}
