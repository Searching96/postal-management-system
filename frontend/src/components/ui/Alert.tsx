import { AlertCircle, CheckCircle } from "lucide-react";
import { ReactNode } from "react";

interface AlertProps {
  type: "error" | "success";
  children: ReactNode;
}

export function Alert({ type, children }: AlertProps) {
  const isError = type === "error";

  return (
    <div
      className={`flex items-start p-4 rounded-lg border ${
        isError ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
      }`}
    >
      {isError ? (
        <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
      ) : (
        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
      )}
      <div className={`text-sm ${isError ? "text-red-600" : "text-green-600"}`}>
        {children}
      </div>
    </div>
  );
}
