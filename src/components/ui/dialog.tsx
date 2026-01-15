import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = ({
    open,
    onOpenChange,
    children,
    className
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    className?: string;
}) => {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => onOpenChange(false)}
        >
            <div
                className={cn("relative bg-background rounded-lg shadow-lg w-full max-w-lg mx-4 p-0 border animate-in zoom-in-95 duration-200", className)}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    )
}

const DialogContent = ({
    className,
    children,
    onClose // Added onClose prop to DialogContent
}: {
    className?: string;
    children: React.ReactNode;
    onClose?: () => void; // Make onClose optional
}) => (
    <div className={cn("p-6", className)}>
        {onClose && ( // Only render button if onClose is provided
            <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </button>
        )}
        {children}
    </div>
)

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-1.5 text-center sm:text-left mb-4",
            className
        )}
        {...props}
    />
)

const DialogTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-lg font-semibold leading-none tracking-tight",
            className
        )}
        {...props}
    />
))
DialogTitle.displayName = "DialogTitle"

export { Dialog, DialogContent, DialogHeader, DialogTitle }
