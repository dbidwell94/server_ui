import { Navigate } from "react-router-dom";
import { useHasAdminQuery } from "../hooks/useHasAdminQuery";
import LoadingSpinner from "./LoadingSpinner";

interface AuthenticatedRouteProps {
  children: React.ReactNode;
}

export default function AuthenticatedRoute({ children }: AuthenticatedRouteProps) {
  const { data, isLoading } = useHasAdminQuery();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If no admin exists, redirect to onboarding
  if (!data?.hasAdmin) {
    return <Navigate to="/onboarding" replace />;
  }

  // If admin exists but user not logged in, redirect to login
  // TODO: Check authentication status here (from localStorage, context, etc.)
  // For now, allow access to authenticated pages
  return <>{children}</>;
}
