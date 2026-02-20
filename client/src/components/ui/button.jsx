import React from "react";

export const Button = React.forwardRef(({ className = "", variant, size, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
    const variantStyles = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground"
    };
    const sizeStyles = {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10"
    };

    const variantClass = variantStyles[variant] || variantStyles.default;
    const sizeClass = sizeStyles[size] || sizeStyles.default;

    return (
        <button
            ref={ref}
            className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = "Button";
