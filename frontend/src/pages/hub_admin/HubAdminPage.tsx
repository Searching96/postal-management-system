import { useState, FormEvent } from "react";
import { hubAdminService } from "../../services/hubAdminService";
import { User, Mail, Lock, Building2 } from "lucide-react";
import type { EmployeeResponse } from "../../models";
import {
  PageHeader,
  Card,
  Alert,
  Button,
  FormInput,
} from "../../components/ui";

export function HubAdminPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    regionId: 1,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<EmployeeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "regionId" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await hubAdminService.registerHubAdmin(formData);
      if (response.success) {
        setSuccess(response.data);
        setFormData({
          fullName: "",
          phone: "",
          email: "",
          password: "",
          regionId: 1,
        });
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to register hub admin"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Hub Administration"
        description="Manage HUB administrators"
      />

      <div className="max-w-2xl">
        <Card title="Register New HUB Admin">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert type="error">{error}</Alert>}

            {success && (
              <Alert type="success">
                <p className="font-medium">
                  Hub Admin registered successfully!
                </p>
                <div className="mt-2">
                  <p>Name: {success.fullName}</p>
                  <p>Role: {success.role}</p>
                  <p>Office: {success.officeName}</p>
                </div>
              </Alert>
            )}

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

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Region
                </label>
                <div className="mt-1 relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    name="regionId"
                    value={formData.regionId}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
                      <option key={id} value={id}>
                        Region {id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              Register Hub Admin
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
