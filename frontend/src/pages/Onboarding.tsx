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

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedData);

    // Validate the specific field onChange
    try {
      await onboardingSchema.validateAt(name, updatedData);
      // Clear error for this field if validation passes
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    } catch (err) {
      // Set error for this field if validation fails
      if (err instanceof Error && "message" in err) {
        setErrors((prev) => ({
          ...prev,
          [name]: err.message,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    try {
      // Validate form data with yup
      await onboardingSchema.validate(formData, { abortEarly: false });
    } catch (err) {
      // Handle validation errors
      if (err instanceof Error && "inner" in err) {
        const validationErrors: Record<string, string> = {};
        (err.inner as Array<{ path: string; message: string }>).forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
      }
      return;
    }

    setIsLoading(true);

    try {
      // Create the user
      await apiClient.post("/user/create", {
        username: formData.username,
        password: formData.password,
      });

      // Auto-login with the credentials
      const loginResponse = await apiClient.post("/user/login", {
        username: formData.username,
        password: formData.password,
      });

      const { user, accessToken } = loginResponse.data;
      setTokens(user, accessToken);

      // Invalidate the has_admin query to trigger a refetch
      await queryClient.invalidateQueries({ queryKey: ["admin", "has_admin"] });

      // Navigate directly to home (authenticated route)
      navigate("/home", { replace: true });
    } catch (err) {
      const errorMessage =
        err instanceof Error && "response" in err
          ? (err as any).response?.data?.message || `Error: ${(err as any).response?.status}`
          : "Failed to create admin user";

      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormCard title="Welcome" subtitle="Create your first admin account to get started">
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

        <Button type="submit" isLoading={isLoading} loadingText="Creating account...">
          Create Admin Account
        </Button>
      </form>
    </FormCard>
  );
}
