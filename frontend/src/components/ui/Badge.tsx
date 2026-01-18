import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" | "primary" | "info" | "ghost" | "danger";
}

export function Badge({ variant = "default", className = "", ...props }: BadgeProps) {
    const variants = {
        default: "bg-gray-100 text-gray-800",
        secondary: "bg-gray-100 text-gray-800",
        primary: "bg-primary-100 text-primary-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        destructive: "bg-red-100 text-red-800",
        danger: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        outline: "border border-gray-200 text-gray-800",
        ghost: "text-gray-600 hover:bg-gray-100",
    };

    const style = variants[variant] || variants.default;

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style} ${className}`}
            {...props}
        />
    );
}
