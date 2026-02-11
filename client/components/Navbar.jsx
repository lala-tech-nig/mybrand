import React from 'react';
import Link from 'next/link';
import Button from './ui/Button';
import { Menu } from 'lucide-react'; // Assuming lucide-react is installed

const Navbar = () => {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold tracking-tighter">
                    my<span className="text-[var(--primary)]">Brand</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/features" className="text-sm font-medium hover:text-[var(--primary)] transition-colors">Features</Link>
                    <Link href="/pricing" className="text-sm font-medium hover:text-[var(--primary)] transition-colors">Pricing</Link>
                    <Link href="/about" className="text-sm font-medium hover:text-[var(--primary)] transition-colors">About</Link>
                </div>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost">Login</Button>
                    </Link>
                    <Link href="/register">
                        <Button>Get Started</Button>
                    </Link>
                </div>

                {/* Mobile Menu Toggle (Simplified for now) */}
                <div className="md:hidden">
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
