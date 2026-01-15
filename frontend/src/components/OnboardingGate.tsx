import { Navigate } from "react-router-dom";
import { useHasAdminQuery } from "../hooks/useHasAdminQuery";
import LoadingSpinner from "./LoadingSpinner";

interface OnboardingGateProps {
  children: React.ReactNode;
}

export default function OnboardingGate({ children }: OnboardingGateProps) {
  const { data, isLoading, isError } = useHasAdminQuery();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If there's an error or no data, assume no admin exists (treat as if checking failed)
  if (isError || !data) {
    return <Navigate to="/onboarding" replace />;
  }

  // If no admin exists, redirect to onboarding
  if (!data.hasAdmin) {
    return <Navigate to="/onboarding" replace />;
  }

  // Otherwise, route is public and accessible
  return <>{children}</>;
}
