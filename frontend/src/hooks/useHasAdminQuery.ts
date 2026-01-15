import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface AdminCheckResponse {
  hasAdmin: boolean;
}

export function useHasAdminQuery() {
  return useQuery<AdminCheckResponse>({
    queryKey: ["admin", "has_admin"],
    queryFn: async () => {
      const response = await axios.get<AdminCheckResponse>(
        "/api/user/has_admin"
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
