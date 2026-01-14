import { useState, FormEvent } from "react";
import { dashboardService } from "../../services/dashboardService";
import { User, Mail, Lock } from "lucide-react";
import {
  PageHeader,
  Card,
  Alert,
  Button,
  FormInput,
} from "../../components/ui";

export function SystemAdminPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await dashboardService.registerAdmin(formData);
      if (response.success) {
        setSuccess("System admin registered successfully!");
        setFormData({ fullName: "", phone: "", email: "", password: "" });
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register admin");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="System Administration"
        description="Manage system administrators"
      />

      <div className="max-w-2xl">
        <Card title="Register New System Admin">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Full Name"
                name="fullName"
                icon={User}
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
              />

              <FormInput
                label="Phone"
                name="phone"
                icon={Mail}
                type="text"
                required
                pattern="[0-9]{10}"
                value={formData.phone}
                onChange={handleChange}
              />

              <FormInput
                label="Email"
                name="email"
                icon={Mail}
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
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
              />
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              Register Admin
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
