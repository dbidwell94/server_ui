import { Navigate } from "react-router-dom";
import { useHasAdminQuery } from "../hooks/useHasAdminQuery";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

export default function ProtectedRoute() {
  const { data, isLoading: isAdminLoading, isError: isAdminError } = useHasAdminQuery();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Show spinner while loading auth state
  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  // If user is authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // Show spinner while loading admin check
  if (isAdminLoading) {
    return <LoadingSpinner />;
  }

  // If admin check failed, assume no admin (safe default for onboarding)
  if (isAdminError) {
    return <Navigate to="/onboarding" replace />;
  }

  // If admin exists but user not authenticated, redirect to login
  if (data?.hasAdmin) {
    return <Navigate to="/login" replace />;
  }

  // If no admin exists, redirect to onboarding
  return <Navigate to="/onboarding" replace />;
}

