import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import FormCard from "../components/FormCard";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import ErrorMessage from "../components/ErrorMessage";
import { onboardingSchema } from "../schemas/onboarding";
import { useHasAdminQuery } from "../hooks/useHasAdminQuery";
import PageLayout from "../components/PageLayout";
import { result } from "@dbidwell94/ts-utils";
import { ValidationError } from "yup";

export default function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: adminData } = useHasAdminQuery();
  const { setTokens } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to home if admin already exists
  useEffect(() => {
    if (adminData?.hasAdmin) {
      navigate("/", { replace: true });
    }
  }, [adminData?.hasAdmin, navigate]);

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedData);

    const res = await result.fromPromise(
      onboardingSchema.validateAt(name, updatedData),
    );

    if (res.isError()) {
      setErrors((prev) => ({
        ...prev,
        [name]: res.error.message,
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    const validationResult = await result.fromPromise(
      onboardingSchema.validate(formData, { abortEarly: false }),
    );

    if (validationResult.isError()) {
      // Handle validation errors
      const err = validationResult.error;
      if (err instanceof ValidationError) {
        const validationErrors: Record<string, string> = {};
        (err.inner as Array<{ path: string; message: string }>).forEach(
          (error) => {
            validationErrors[error.path] = error.message;
          },
        );
        setErrors(validationErrors);
      }
      return;
    }

    setIsLoading(true);

    const createResult = await result.fromPromise(
      apiClient.post("/user/onboarding", {
        username: formData.username,
        password: formData.password,
      }),
    );

    if (createResult.isError()) {
      const errorMessage =
        (createResult.error as any).response?.data?.message ||
        `Error: ${(createResult.error as any).response?.status}` ||
        "Failed to create admin user";
      setServerError(errorMessage);
      setIsLoading(false);
      return;
    }

    // Auto-login with the credentials
    const loginResult = await result.fromPromise(
      apiClient.post("/user/login", {
        username: formData.username,
        password: formData.password,
      }),
    );

    if (loginResult.isError()) {
      setServerError("Failed to log in after creating account");
      setIsLoading(false);
      return;
    }

    const { user, accessToken } = loginResult.value.data;
    setTokens(user, accessToken);

    // Invalidate the has_admin query to trigger a refetch
    await queryClient.invalidateQueries({ queryKey: ["admin", "has_admin"] });

    // Navigate directly to home (authenticated route)
    navigate("/home", { replace: true });
  };

  return (
    <PageLayout showFooter showNavbar={false}>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <FormCard
          title="Welcome"
          subtitle="Create your first admin account to get started"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextInput
              id="username"
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="admin"
              helperText={errors.username}
            />

            <TextInput
              id="password"
              name="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="••••••••"
              helperText={errors.password}
            />

            <TextInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="••••••••"
              helperText={errors.confirmPassword}
            />

            {serverError && <ErrorMessage message={serverError} />}

            <Button
              type="submit"
              isLoading={isLoading}
              loadingText="Creating account..."
            >
              Create Admin Account
            </Button>
          </form>
        </FormCard>
      </div>
    </PageLayout>
  );
}
