import { useQuery } from "@tanstack/react-query";
import apiClient from "../lib/api";

interface User {
  id: number;
  username: string;
}

export function useWhoami() {
  return useQuery<User>({
    queryKey: ["auth", "whoami"],
    queryFn: async () => {
      const response = await apiClient.get<User>("/user/whoami");
      return response.data;
    },
    // Don't retry on auth errors
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}
