import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../components/PageLayout";
import FormCard from "../components/FormCard";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import ErrorMessage from "../components/ErrorMessage";

export default function Login() {
  const navigate = useNavigate();
  const { setTokens } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.username.trim()) {
      setError("Username is required");
      return;
    }

    if (!formData.password) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post("/user/login", {
        username: formData.username,
        password: formData.password,
      });

      const { user, accessToken } = response.data;
      setTokens(user, accessToken);
      navigate("/");
    } catch (err) {
      const errorMessage =
        err instanceof Error && "response" in err
          ? (err as any).response?.data?.message || "Invalid credentials"
          : "Login failed";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout showFooter>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <FormCard title="Login" subtitle="Sign in to your account">
          <form onSubmit={handleSubmit} className="space-y-6">
        <TextInput
          id="username"
          name="username"
          label="Username"
          value={formData.username}
          onChange={handleInputChange}
          disabled={isLoading}
          placeholder="Enter your username"
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
        />

        {error && <ErrorMessage message={error} />}

        <Button type="submit" isLoading={isLoading} loadingText="Signing in...">
          Sign In
        </Button>
      </form>
        </FormCard>
      </div>
    </PageLayout>
  );
}
