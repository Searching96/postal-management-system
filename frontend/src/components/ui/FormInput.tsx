import { LucideIcon } from "lucide-react";
import { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

export function FormInput({
  label,
  icon: Icon,
  error,
  className = "",
  ...props
}: FormInputProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-bold text-gray-700 ml-1">{label}</label>
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
        )}
        <input
          {...props}
          className={`
            block w-full transition-all text-sm
            ${Icon ? "pl-10" : "pl-4"} 
            pr-4 py-2.5 border rounded-xl outline-none
            ${error
              ? "border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500"
              : "border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 group-hover:border-gray-300"
            } 
            ${className}
          `}
        />
      </div>
      {error && <p className="text-xs font-medium text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
}
