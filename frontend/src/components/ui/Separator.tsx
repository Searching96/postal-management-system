import { HTMLAttributes } from "react";

interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    orientation?: "horizontal" | "vertical";
}

export function Separator({ className = "", orientation = "horizontal", ...props }: SeparatorProps) {
    return (
        <div
            className={`bg-gray-200 shrink-0 ${orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"} ${className}`}
            {...props}
        />
    );
}
