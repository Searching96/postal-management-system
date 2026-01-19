import * as React from "react";

const TabsContext = React.createContext<{
    value: string;
    onValueChange: (value: string) => void;
} | null>(null);

export function Tabs({ value, onValueChange, children, className }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode, className?: string }) {
    return (
        <TabsContext.Provider value={{ value, onValueChange }}>
            <div className={`w-full ${className || ''}`}>{children}</div>
        </TabsContext.Provider>
    );
}

export function TabsList({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 mb-4 ${className || ''}`}>
            {children}
        </div>
    );
}

export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
    const context = React.useContext(TabsContext);
    if (!context) return null;

    const isActive = context.value === value;

    return (
        <button
            type="button"
            onClick={() => context.onValueChange(value)}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${isActive ? "bg-white text-gray-950 shadow-sm" : "hover:bg-gray-50 hover:text-gray-900"
                }`}
        >
            {children}
        </button>
    );
}

export function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
    const context = React.useContext(TabsContext);
    if (!context || context.value !== value) return null;

    return <div className="mt-2 outline-none">{children}</div>;
}
