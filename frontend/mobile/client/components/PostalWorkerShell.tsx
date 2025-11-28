import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  House,
  Package,
  ArrowUpDown,
  Truck,
  List,
} from "lucide-react";
import { ReactNode } from "react";

interface PostalWorkerShellProps {
  title?: string;
  children: ReactNode;
  userName?: string;
  role?: string;
}

const tabs = [
  { to: "/postal-worker", label: "Dashboard", icon: House },
  { to: "/postal-worker/package", label: "Đơn hàng", icon: Package },
  { to: "/postal-worker/dispatch", label: "Xuất kho", icon: Truck },
  { to: "/postal-worker/packages", label: "Tra cứu", icon: List },
];

export default function PostalWorkerShell({ title, children, userName, role }: PostalWorkerShellProps) {
  const location = useLocation();

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
            {tabs.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
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
