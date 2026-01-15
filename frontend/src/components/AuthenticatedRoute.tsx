import { Navigate } from "react-router-dom";
import { useHasAdminQuery } from "../hooks/useHasAdminQuery";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

interface AuthenticatedRouteProps {
  children: React.ReactNode;
}

export default function AuthenticatedRoute({ children }: AuthenticatedRouteProps) {
  const { data, isLoading: isAdminLoading } = useHasAdminQuery();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  if (isAdminLoading || isAuthLoading) {
    return <LoadingSpinner />;
  }

  // If no admin exists, redirect to onboarding
  if (!data?.hasAdmin) {
    return <Navigate to="/onboarding" replace />;
  }

  // If admin exists but user not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
