import { useState, FormEvent } from "react";
import { wardManagerService } from "../../services/wardManagerService";
import { User, Mail, Lock, Users } from "lucide-react";
import type { EmployeeResponse } from "../../models";
import {
  PageHeader,
  Card,
  Alert,
  Button,
  FormInput,
} from "../../components/ui";

export function WardManagerPage() {
  const [activeForm, setActiveForm] = useState<"staff" | "manager" | null>(
    null
  );
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<EmployeeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setIsLoading(true);

    try {
      const response =
        activeForm === "staff"
          ? await wardManagerService.createStaff(formData)
          : await wardManagerService.createWardManager(formData);

      if (response.success) {
        setSuccess(response.data);
        setFormData({ fullName: "", phone: "", email: "", password: "" });
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create employee"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setActiveForm(null);
    setFormData({ fullName: "", phone: "", email: "", password: "" });
    setError("");
    setSuccess(null);
  };

  return (
    <div>
      <PageHeader
        title="Ward Management"
        description="Manage staff in your ward office"
      />

      {!activeForm ? (
        <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
          <button
            onClick={() => setActiveForm("staff")}
            className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-shadow"
          >
            <Users className="h-8 w-8 text-blue-500 mb-2" />
            <h3 className="font-semibold text-gray-900">Create Staff</h3>
            <p className="text-sm text-gray-500">
              Add new staff member to your office
            </p>
          </button>

          <button
            onClick={() => setActiveForm("manager")}
            className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-shadow"
          >
            <Users className="h-8 w-8 text-green-500 mb-2" />
            <h3 className="font-semibold text-gray-900">Create Ward Manager</h3>
            <p className="text-sm text-gray-500">Add another ward manager</p>
          </button>
        </div>
      ) : (
        <div className="max-w-2xl">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Create New {activeForm === "staff" ? "Staff" : "Ward Manager"}
              </h2>
              <button
                onClick={resetForm}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <Alert type="error">{error}</Alert>}

              {success && (
                <Alert type="success">
                  <p className="font-medium">Employee created!</p>
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
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full">
                Create {activeForm === "staff" ? "Staff" : "Ward Manager"}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
