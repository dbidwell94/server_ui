import { Navigate } from "react-router-dom";
import { useHasAdminQuery } from "../hooks/useHasAdminQuery";
import LoadingSpinner from "./LoadingSpinner";

export default function ProtectedRoute() {
  const { data, isLoading } = useHasAdminQuery();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If admin exists, redirect to login
  if (data?.hasAdmin) {
    return <Navigate to="/login" replace />;
  }

  // If no admin exists, redirect to onboarding
  return <Navigate to="/onboarding" replace />;
}

