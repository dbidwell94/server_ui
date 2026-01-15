import { useEffect, useState } from "react";
import axios from "axios";

interface AdminCheckResponse {
  hasAdmin: boolean;
}

interface AdminCheckData {
  hasAdmin: boolean;
  loading: boolean;
  error: string | null;
}

export function useHasAdmin() {
  const [state, setState] = useState<AdminCheckData>({
    hasAdmin: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await axios.get<AdminCheckResponse>(
          "/api/user/has_admin"
        );
        setState({
          hasAdmin: response.data.hasAdmin,
          loading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.status
            ? `HTTP ${error.response.status}`
            : error.message
          : "Unknown error";

        setState({
          hasAdmin: false,
          loading: false,
          error: errorMessage,
        });
      }
    };

    checkAdmin();
  }, []);

  return state;
}
