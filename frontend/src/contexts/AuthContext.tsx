import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import apiClient, { setAccessToken } from "../lib/api";

interface User {
  id: number;
  username: string;
}

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
    const validateAuth = async () => {
      try {
        const response = await apiClient.get<User>("/user/whoami");
        const userData = response.data;
        setUser(userData);
        setAccessTokenState("cached"); // Just indicate we have a token
      } catch (error) {
        // /whoami failed - might be no token, or token expired
        // Try to refresh using the refresh token cookie
        try {
          console.log("No access token, attempting to refresh...");
          const refreshResponse = await apiClient.post("/user/refresh", {});
          const newAccessToken = refreshResponse.data.accessToken;
          setAccessToken(newAccessToken);
          setAccessTokenState(newAccessToken);

          // Now try whoami again with the new token
          const whoamiResponse = await apiClient.get<User>("/user/whoami");
          setUser(whoamiResponse.data);
        } catch (refreshError) {
          // Refresh also failed - user is not authenticated
          console.log("Refresh failed, user not authenticated");
          setUser(null);
          setAccessTokenState(null);
          setAccessToken(null);
        }
      } finally {
        setIsLoading(false);
      }
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
