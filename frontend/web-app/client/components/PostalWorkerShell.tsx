import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  House,
  Package,
  Truck,
  List,
  Menu,
  LogOut,
  User,
} from "lucide-react";
import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostalWorkerShellProps {
  title?: string;
  children: ReactNode;
  userName?: string;
  role?: string;
}

const navigationItems = [
  { to: "/postal-worker/home", label: "Dashboard", icon: House },
  { to: "/postal-worker/package", label: "Nhận kiện hàng", icon: Package },
  { to: "/postal-worker/packages", label: "Tra cứu & In tem", icon: List },
  { to: "/postal-worker/complaints", label: "Xử lý khiếu nại", icon: List },
  { to: "/postal-worker/tickets", label: "Quản lý ticket", icon: Truck },
];

export default function PostalWorkerShell({ title, children, userName, role }: PostalWorkerShellProps) {
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  // Desktop Layout
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-muted/30 border-r flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b">
              <div className="font-extrabold tracking-tight text-xl">PostalFlow</div>
              <div className="text-sm text-muted-foreground mt-1">Hệ thống quản lý bưu điện</div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigationItems.map(({ to, label, icon: Icon }) => {
                const active = isActive(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      active 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-auto p-3">
                    <User className="h-4 w-4" />
                    <div className="flex flex-col items-start text-left">
                      <div className="text-sm font-medium">{userName ?? "Nguyễn Thị E"}</div>
                      <div className="text-xs text-muted-foreground">{role ?? "Nhân viên bưu điện"}</div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Thông tin cá nhân
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-background border-b px-6 py-4">
              <div className="flex items-center justify-between">
                {title && (
                  <h1 className="text-2xl font-semibold">{title}</h1>
                )}
                <div className="flex items-center gap-4">
                  {/* Additional header actions can go here */}
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-auto bg-muted/20">
              <div className="p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Layout (fallback)
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-start justify-center">
      <div className="w-full max-w-md bg-background flex flex-col min-h-screen border" style={{ borderColor: "rgba(217, 217, 217, 1)" }}>
        <header className="sticky top-0 z-20 backdrop-blur bg-background/80 border-b">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="font-extrabold tracking-tight text-lg">PostalFlow</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="text-right leading-tight">
                <div className="font-medium">{userName ?? "Nguyễn Thị E"}</div>
                <div className="text-muted-foreground">{role ?? "Nhân viên bưu điện"}</div>
              </div>
            </div>
          </div>
          {title && (
            <div className="px-4 pb-3 text-xl font-semibold">
              {title}
            </div>
          )}
        </header>

        <main className="flex-1 px-4 py-4">{children}</main>

        <nav className="sticky bottom-0 z-20 border-t bg-background/95 backdrop-blur">
          <ul className="grid grid-cols-4">
            {navigationItems.map(({ to, label, icon: Icon }) => {
              const active = isActive(to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={cn(
                      "flex flex-col items-center gap-1 py-2 text-xs",
                      active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className={cn("h-5 w-5", active && "fill-primary/10")}/>
                    <span className="truncate">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
