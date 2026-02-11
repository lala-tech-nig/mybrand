import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
    return (
        <div className={`rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] shadow-sm ${className}`} {...props}>
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '', ...props }) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>{children}</div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
    <h3 className={`font-semibold leading-none tracking-tight ${className}`} {...props}>{children}</h3>
);

export const CardContent = ({ children, className = '', ...props }) => (
    <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>
);
