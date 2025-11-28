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
import PostalWorkerDispatch from "./pages/postal-worker/Dispatch";
import PackageList from "./pages/postal-worker/PackageList";
import PostalWorkerPackage from "./pages/postal-worker/Package";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          
          <Route path="/customer" element={<CustomerIndex />} />
          <Route path="/customer/orders" element={<CustomerOrders />} />
          <Route path="/customer/tracking" element={<CustomerTracking />} />
          <Route path="/customer/pickup" element={<CustomerPickup />} />
          <Route path="/customer/complaint" element={<CustomerComplaint />} />
          
          <Route path="/delivery-driver" element={<DriverIndex />} />
          <Route path="/delivery-driver/scanner" element={<Scanner />} />
          <Route path="/delivery-driver/map" element={<DeliveriesMap/>} />

                    
          <Route path="/postal-worker" element={<PostalWorkerIndex />} />
          <Route path="/postal-worker/package" element={<PostalWorkerPackage />} />
          <Route path="/postal-worker/dispatch" element={<PostalWorkerDispatch />} />
          <Route path="/postal-worker/packages" element={<PackageList />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
