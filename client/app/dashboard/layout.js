'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, MessageSquare, Settings, LogOut, ExternalLink, Flame, Menu, X } from 'lucide-react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardContent = ({ children }) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab');
    const router = useRouter();
    const [brand, setBrand] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Fetch current brand info
        api.get('/api/auth/me')
            .then(res => setBrand(res.data.brand))
            .catch(() => {
                localStorage.removeItem('token');
                router.push('/login');
            });
    }, [router]);

    // Close sidebar on route/tab change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname, currentTab]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    if (!brand) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    const navItemsList = (
        <nav className="flex-1 px-4 space-y-2 mt-6">
            <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" active={!currentTab || currentTab === 'overview'} />
            <NavItem href="/dashboard?tab=products" icon={<ShoppingBag size={20} />} label="Products" active={currentTab === 'products'} />
            <NavItem href="/dashboard?tab=posts" icon={<MessageSquare size={20} />} label="Posts" active={currentTab === 'posts'} />
            <NavItem href="/dashboard/drags" icon={<Flame size={20} />} label="Drags" active={pathname.startsWith('/dashboard/drags')} />
            <NavItem href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" active={pathname.startsWith('/dashboard/settings')} />
        </nav>
    );

    const sidebarFooter = (
        <div className="p-4 border-t border-gray-200">
            <div className="mb-4 px-4 py-3 bg-zinc-50 rounded-lg border border-zinc-100">
                <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Your Store</p>
                <a href={`${process.env.NEXT_PUBLIC_API_URL_FRONT?.replace('/api', '') || ''}/${brand.username}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#FF6600] hover:text-orange-600 flex items-center gap-1">
                    {brand.username}.mybrand... <ExternalLink size={12} />
                </a>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors">
                <LogOut size={20} />
                Logout
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
                <h2 className="text-xl font-bold tracking-tight">my<span className="text-[#FF6600]">Brand</span></h2>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                    <Menu size={24} />
                </button>
            </header>

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 hidden md:flex flex-col">
                <div className="p-6">
                    <h2 className="text-2xl font-bold tracking-tight">my<span className="text-[#FF6600]">Brand</span></h2>
                </div>
                {navItemsList}
                {sidebarFooter}
            </aside>

            {/* Mobile Sidebar Overlay (Backdrop) */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/50 z-[60] md:hidden backdrop-blur-sm"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 h-full w-72 bg-white z-[70] md:hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-6 flex items-center justify-between border-b border-gray-100">
                                <h2 className="text-2xl font-bold tracking-tight">my<span className="text-[#FF6600]">Brand</span></h2>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-2 text-zinc-400 hover:text-black transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto pt-4">
                                {navItemsList}
                            </div>
                            {sidebarFooter}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8">
                {children}
            </main>
        </div>
    );
};

export default function DashboardLayout({ children }) {
    return (
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <DashboardContent children={children} />
        </React.Suspense>
    );
}

function NavItem({ href, icon, label, active }) {
    return (
        <Link href={href}>
            <span className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${active ? 'bg-black text-white shadow-md' : 'text-zinc-600 hover:bg-zinc-100 hover:text-black'}`}>
                {icon}
                {label}
            </span>
        </Link>
    );
}
