import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  House,
  QrCode,
  MapPin,
} from "lucide-react";
import { ReactNode } from "react";

interface DriverShellProps {
  title?: string;
  children: ReactNode;
  userName?: string;
  role?: string;
}

const tabs = [
  { to: "/delivery-driver/home", label: "Dashboard", icon: House },
  { to: "/delivery-driver/scanner", label: "QR Scanner", icon: QrCode },
  { to: "/delivery-driver/map", label: "Bản đồ", icon: MapPin },
];

export default function DriverShell({ title, children, userName, role }: DriverShellProps) {
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-start justify-center">
      <div className="w-full max-w-md bg-background flex flex-col min-h-screen border" style={{ borderColor: "rgba(217, 217, 217, 1)" }}>
        <header className="sticky top-0 z-20 backdrop-blur bg-background/80 border-b">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="font-extrabold tracking-tight text-lg">PostalFlow</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="text-right leading-tight">
                <div className="font-medium">{userName ?? "Nguyễn Văn A"}</div>
                <div className="text-muted-foreground">{role ?? "Bưu tá"}</div>
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
          <ul className="grid grid-cols-3">
            {tabs.map(({ to, label, icon: Icon }) => {
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
