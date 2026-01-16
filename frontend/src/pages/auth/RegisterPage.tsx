import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { User, Mail, Lock, CheckCircle } from "lucide-react";
import { Alert, Button, FormInput, AddressSelector } from "../../components/ui";

export function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
    email: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.register(formData);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Registration Successful!
          </h2>
          <p className="mt-2 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Register as a new customer
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && <Alert type="error">{error}</Alert>}

          <FormInput
            label="Full Name"
            name="fullName"
            icon={User}
            type="text"
            required
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
          />

          <FormInput
            label="Phone Number"
            name="username"
            icon={Mail}
            type="text"
            required
            pattern="[0-9]{10}"
            value={formData.username}
            onChange={handleChange}
            placeholder="0123456789"
          />

          <FormInput
            label="Email"
            name="email"
            icon={Mail}
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
          />

          <FormInput
            label="Password"
            name="password"
            icon={Lock}
            type="password"
            required
            minLength={6}
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••"
          />

          <AddressSelector
            label="Địa chỉ thường trú"
            required
            onAddressChange={(val) => setFormData((prev) => ({ ...prev, address: val }))}
          />

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full py-3 mt-6"
          >
            Create Account
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
