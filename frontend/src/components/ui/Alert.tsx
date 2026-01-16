import { AlertCircle, CheckCircle, X } from "lucide-react";
import { ReactNode } from "react";

interface AlertProps {
  type: "error" | "success" | "warning" | "info";
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({ type, children, onClose, className = "" }: AlertProps) {
  const styles = {
    error: "bg-red-50 border-red-200 text-red-600",
    success: "bg-green-50 border-green-200 text-green-600",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-600",
    info: "bg-blue-50 border-blue-200 text-blue-600",
  };

  const Icons = {
    error: AlertCircle,
    success: CheckCircle,
    warning: AlertCircle,
    info: AlertCircle,
  };

  const Icon = Icons[type];

  return (
    <div
      className={`flex items-start p-4 rounded-xl border animate-in fade-in slide-in-from-top-1 ${styles[type]} ${className}`}
    >
      <Icon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
      <div className="text-sm font-medium flex-1">
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto -mr-1 -mt-1 p-1 hover:bg-black/5 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
