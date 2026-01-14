import { useAuth } from "../lib/AuthContext";
import { MapPin, Users, Building2, Package } from "lucide-react";

export function DashboardPage() {
  const { user } = useAuth();

  const isCustomer = user?.role === "CUSTOMER";

  const stats = [
    { label: "Active Orders", value: "—", icon: Package, color: "bg-blue-500" },
    { label: "Delivered", value: "—", icon: MapPin, color: "bg-green-500" },
    { label: "Pending", value: "—", icon: Building2, color: "bg-yellow-500" },
    { label: "Total", value: "—", icon: Users, color: "bg-purple-500" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Welcome back, {user && "fullName" in user ? user.fullName : "User"}!
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Your Profile
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="font-medium">{user?.role}</p>
          </div>
          {user && "phone" in user && (
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{user.phone}</p>
            </div>
          )}
          {user && "email" in user && (
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          )}
          {user && "officeName" in user && (
            <div>
              <p className="text-sm text-gray-500">Office</p>
              <p className="font-medium">{user.officeName}</p>
            </div>
          )}
          {user && "officeType" in user && (
            <div>
              <p className="text-sm text-gray-500">Office Type</p>
              <p className="font-medium">{user.officeType}</p>
            </div>
          )}
          {isCustomer && user && "address" in user && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{user.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left">
            <Package className="h-8 w-8 text-primary-500 mb-2" />
            <p className="font-medium text-gray-900">Create Order</p>
            <p className="text-sm text-gray-500">Start a new delivery</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left">
            <MapPin className="h-8 w-8 text-primary-500 mb-2" />
            <p className="font-medium text-gray-900">Track Package</p>
            <p className="text-sm text-gray-500">Find your delivery</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left">
            <Building2 className="h-8 w-8 text-primary-500 mb-2" />
            <p className="font-medium text-gray-900">View Offices</p>
            <p className="text-sm text-gray-500">Find nearest office</p>
          </button>
        </div>
      </div>
    </div>
  );
}
