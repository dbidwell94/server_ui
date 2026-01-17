import axios from "axios";
import { result } from "@dbidwell94/ts-utils";

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true, // Send cookies with all requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Store access token in memory (sessionStorage would also work)
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

export const getAccessToken = () => accessToken;

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Guard: Not a 401 or already retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Guard: No access token to refresh with
    if (!getAccessToken()) {
      return Promise.reject(error);
    }

    // Guard: Already refreshing - queue this request
    if (isRefreshing) {
      return new Promise((resolve) => {
        addRefreshSubscriber((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshResult = await result.fromPromise(
      axios.post("/api/user/refresh", {}, { withCredentials: true }),
    );

    try {
      const newAccessToken = refreshResult.unwrap().data.accessToken;
      setAccessToken(newAccessToken);

      // Retry original request with new token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      onRefreshed(newAccessToken);

      return apiClient(originalRequest);
    } catch (err) {
      setAccessToken(null);
      throw err;
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
