import { Navigate } from "react-router-dom";
import { useHasAdminQuery } from "../hooks/useHasAdminQuery";
import LoadingSpinner from "./LoadingSpinner";

interface AdminRequiredRouteProps {
  children: React.ReactNode;
}

export default function AdminRequiredRoute({ children }: AdminRequiredRouteProps) {
  const { data, isLoading: isAdminLoading } = useHasAdminQuery();

  if (isAdminLoading) {
    return <LoadingSpinner />;
  }

  // If no admin exists, redirect to onboarding
  if (!data?.hasAdmin) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
