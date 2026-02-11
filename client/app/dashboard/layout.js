'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, MessageSquare, Settings, LogOut, ExternalLink } from 'lucide-react';
import axios from 'axios';

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [brand, setBrand] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Fetch current brand info
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            headers: { 'x-auth-token': token }
        })
            .then(res => setBrand(res.data.brand))
            .catch(() => {
                localStorage.removeItem('token');
                router.push('/login');
            });
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    if (!brand) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 hidden md:flex flex-col">
                <div className="p-6">
                    <h2 className="text-2xl font-bold tracking-tight">my<span className="text-[var(--primary)]">Brand</span></h2>
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" active={pathname === '/dashboard'} />
                    <NavItem href="/dashboard/products" icon={<ShoppingBag size={20} />} label="Products" active={pathname.startsWith('/dashboard/products')} />
                    <NavItem href="/dashboard/posts" icon={<MessageSquare size={20} />} label="Posts" active={pathname.startsWith('/dashboard/posts')} />
                    <NavItem href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" active={pathname.startsWith('/dashboard/settings')} />
                </nav>
                <div className="p-4 border-t border-gray-200">
                    <div className="mb-4 px-4 py-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Your Link</p>
                        <a href={`/${brand.username}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
                            {brand.username}.mybrand... <ExternalLink size={12} />
                        </a>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 w-full">
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                {children}
            </main>
        </div>
    );
}

function NavItem({ href, icon, label, active }) {
    return (
        <Link href={href}>
            <span className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${active ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}>
                {icon}
                {label}
            </span>
        </Link>
    );
}
