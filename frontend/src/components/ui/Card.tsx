import { ReactNode, HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className = "", title, ...props }: CardProps) {
  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100", title && "p-6", className)} {...props}>
      {title && (
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      )}
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pb-2", className)} {...props}>{children}</div>
}

export function CardTitle({ children, className = "", ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold text-gray-900", className)} {...props}>{children}</h3>
}

export function CardContent({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-2", className)} {...props}>{children}</div>
}
