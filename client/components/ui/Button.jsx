import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 px-4 py-2";

    const variants = {
        primary: "bg-[var(--primary)] text-white hover:bg-[#e65c00]",
        secondary: "bg-black text-white hover:bg-zinc-800",
        outline: "border border-[var(--border)] bg-transparent hover:bg-[var(--muted)] text-[var(--foreground)]",
        ghost: "hover:bg-[var(--muted)] text-[var(--foreground)]",
    };

    return (
        <button className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
