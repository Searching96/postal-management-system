// Auth pages
export { LoginPage, RegisterPage } from "./auth";

// Common pages
export { DashboardPage, ProvincesPage, ProfilePage, MessagesPage } from "./common";

// Role-specific pages
export { SystemAdminPage } from "./system_admin";
export { HubAdminPage } from "./hub_admin";
export { ProvinceAdminPage } from "./province_admin";
export { OrderListPage, CreateOrderPage, OrderDetailsPage, TrackOrderPage, PendingPickupsPage, AssignDeliveryPage } from "./orders";
export { BatchListPage, BatchDetailsPage } from "./batches";
export { ShipperManagementPage, RouteManagementPage } from "./admin";
export { LiveTrackingPage } from "./tracking";
export * from "./offices";
export { WardManagerPage } from "./ward_manager";
export { ShipperDashboardPage } from "./shipper";
export { CustomerPickupPage } from "./customer";
