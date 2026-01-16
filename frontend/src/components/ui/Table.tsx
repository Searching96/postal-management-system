import { HTMLAttributes, forwardRef } from "react";

export const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
    ({ className = "", ...props }, ref) => (
        <div className="w-full overflow-auto">
            <table
                ref={ref}
                className={`w-full caption-bottom text-sm ${className}`}
                {...props}
            />
        </div>
    )
);
Table.displayName = "Table";
