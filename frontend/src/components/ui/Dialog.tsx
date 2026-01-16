import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
    // We can use context here if we want to be fancy, but purely structural for now
    // children will include DialogContent which handles the overlay

    // Inject props into children if they are DialogContent? 
    // Easier pattern: Just pass open state to children via cloneElement?
    // Or just let Dialog be a wrapper and DialogContent handle the render based on props? 

    // Simplification for the specific usage in this project:
    return (
        <React.Fragment>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    // @ts-ignore
                    return React.cloneElement(child, { open, onOpenChange });
                }
                return child;
            })}
        </React.Fragment>
    );
};

export const DialogContent = ({ open, onOpenChange, children, className = "" }: any) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onOpenChange?.(false);
        };
        if (open) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => onOpenChange?.(false)} />
            <div className={`relative w-full max-w-lg bg-white rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in duration-200 ${className}`}>
                {children}
                <button
                    onClick={() => onOpenChange?.(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </div>
        </div>
    );
};

export const DialogHeader = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`flex flex-col space-y-1.5 p-6 text-center sm:text-left ${className}`} {...props} />
);

export const DialogTitle = ({ className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props} />
);

export const DialogFooter = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0 ${className}`} {...props} />
);
