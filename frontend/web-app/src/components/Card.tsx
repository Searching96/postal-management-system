import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  className,
  title,
  subtitle,
  action,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-secondary-200 shadow-sm",
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-secondary-200 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-secondary-900">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-secondary-500">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

Card.displayName = "Card";
