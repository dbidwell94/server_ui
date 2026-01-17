import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";
import apiClient, { setAccessToken } from "../lib/api";
import type { Minimum as User } from "../bindings";
import { result } from "@dbidwell94/ts-utils";

export type { User };

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setTokens: (user: User, accessToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate auth on mount by calling whoami
  useEffect(() => {
    const clearAuth = () => {
      setUser(null);
      setAccessTokenState(null);
      setAccessToken(null);
    };

    const validateAuth = async () => {
      const whoamiResult = await result.fromPromise(
        apiClient.get<User>("/user/whoami"),
      );

      if (whoamiResult.isOk()) {
        setUser(whoamiResult.value.data);
        setAccessTokenState("cached"); // Just indicate we have a token
        setIsLoading(false);
        return;
      }

      // Guard: Only try to refresh if we get a 401 (unauthorized)
      const isUnauthorized =
        axios.isAxiosError(whoamiResult.error) &&
        whoamiResult.error.response?.status === 401;

      if (!isUnauthorized) {
        // For other errors, just stay unauthenticated
        clearAuth();
        setIsLoading(false);
        return;
      }

      const refreshResult = await result.fromPromise(
        apiClient.post("/user/refresh", {}),
      );

      if (refreshResult.isError()) {
        clearAuth();
        setIsLoading(false);
        return;
      }

      const newAccessToken = refreshResult.value.data.accessToken;
      setAccessToken(newAccessToken);
      setAccessTokenState(newAccessToken);

      // Now try whoami again with the new token
      const retryResult = await result.fromPromise(
        apiClient.get<User>("/user/whoami"),
      );

      if (retryResult.isOk()) {
        setUser(retryResult.value.data);
      } else {
        clearAuth();
      }

      setIsLoading(false);
    };

    validateAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await apiClient.post("/user/login", {
      username,
      password,
    });

    const { user: userData, accessToken: token } = response.data;
    setUser(userData);
    setAccessTokenState(token);
    setAccessToken(token);
    setIsLoading(false); // Clear loading state after login
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAccessTokenState(null);
    setAccessToken(null);
    setIsLoading(false); // Clear loading state after logout
  }, []);

  const setTokens = useCallback((userData: User, token: string) => {
    setUser(userData);
    setAccessTokenState(token);
    setAccessToken(token);
    setIsLoading(false); // Clear loading state when tokens are set
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        login,
        logout,
        setTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
