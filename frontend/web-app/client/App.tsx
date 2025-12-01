import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import CustomerIndex from "./pages/customer/Index";
import CustomerPickup from "./pages/customer/Pickup";
import CustomerComplaint from "./pages/customer/Complaint";
import CustomerOrders from "./pages/customer/Orders";
import CustomerTracking from "./pages/customer/Tracking";
import DriverIndex from "./pages/delivery-driver/Index";
import { Scanner } from "./pages/delivery-driver/Scanner";
import { DeliveriesMap } from "./pages/delivery-driver/DeliveriesMap";
import PostalWorkerIndex from "./pages/postal-worker/Index";
import PackageList from "./pages/postal-worker/PackageList";
import PackageIngest from "./pages/postal-worker/PackageIngest";
import ComplaintResolver from "./pages/postal-worker/ComplaintResolver";
import TicketManagement from "./pages/postal-worker/TicketManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* role home routes */}
          <Route path="/customer/home" element={<CustomerIndex />} />
          <Route path="/delivery-driver/home" element={<DriverIndex />} />
          <Route path="/postal-worker/home" element={<PostalWorkerIndex />} />

          {/* keep legacy/other routes */}
          <Route path="/customer/orders" element={<CustomerOrders />} />
          <Route path="/customer/tracking" element={<CustomerTracking />} />
          <Route path="/customer/pickup" element={<CustomerPickup />} />
          <Route path="/customer/complaint" element={<CustomerComplaint />} />
          
          <Route path="/delivery-driver/scanner" element={<Scanner />} />
          <Route path="/delivery-driver/map" element={<DeliveriesMap/>} />

          <Route path="/postal-worker/package" element={<PackageIngest />} />
          <Route path="/postal-worker/packages" element={<PackageList />} />
          <Route path="/postal-worker/complaints" element={<ComplaintResolver />} />
          <Route path="/postal-worker/tickets" element={<TicketManagement />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
