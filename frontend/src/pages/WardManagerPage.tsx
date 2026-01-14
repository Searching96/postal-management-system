import { useState, FormEvent } from "react";
import { wardManagerService } from "../services/wardManagerService";
import {
  User,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Users,
} from "lucide-react";
import type { EmployeeResponse } from "../models";

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ward Management</h1>
        <p className="mt-1 text-gray-600">Manage staff in your ward office</p>
      </div>

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
          <div className="bg-white rounded-xl shadow-sm p-6">
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
              {error && (
                <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-sm font-medium text-green-600">
                      Employee created!
                    </p>
                  </div>
                  <div className="text-sm text-green-700">
                    <p>Name: {success.fullName}</p>
                    <p>Role: {success.role}</p>
                    <p>Office: {success.officeName}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      name="phone"
                      type="text"
                      required
                      pattern="[0-9]{10}"
                      value={formData.phone}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isLoading
                  ? "Creating..."
                  : `Create ${
                      activeForm === "staff" ? "Staff" : "Ward Manager"
                    }`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
