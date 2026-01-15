import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FormCard from "../components/FormCard";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import ErrorMessage from "../components/ErrorMessage";

export default function Onboarding() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.username.trim()) {
      setError("Username is required");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await axios.post("/api/user/create", {
        username: formData.username,
        password: formData.password,
      });

      // Redirect to home on success
      navigate("/");
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || `Error: ${err.response?.status}`
        : "Failed to create admin user";

      setError(errorMessage);
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
          helperText="At least 8 characters"
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
        />

        {error && <ErrorMessage message={error} />}

        <Button type="submit" isLoading={isLoading} loadingText="Creating account...">
          Create Admin Account
        </Button>
      </form>
    </FormCard>
  );
}
