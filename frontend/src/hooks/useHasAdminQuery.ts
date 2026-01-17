import { useQuery } from "@tanstack/react-query";
import apiClient from "../lib/api";

interface AdminCheckResponse {
  hasAdmin: boolean;
}

export function useHasAdminQuery() {
  return useQuery<AdminCheckResponse, Error>({
    queryKey: ["admin", "has_admin"],
    queryFn: async () => {
      // Note: apiClient has /api as baseURL, so this becomes /api/user/has_admin
      const response =
        await apiClient.get<AdminCheckResponse>("/user/has_admin");
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });
}
