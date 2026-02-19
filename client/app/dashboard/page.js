'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../utils/api';
import { ArrowRight, CheckCircle2, Circle, ExternalLink, Zap, Eye, MousePointerClick, Users, Gem, Clock, Package, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import ProductsView from './_components/ProductsView';
import PostsView from './_components/PostsView';

const GEM_TIERS = [
    { name: 'Bronze', emoji: '🥉', gradient: 'from-amber-700 to-amber-500', monthlyPrice: 500, yearlyPrice: 4800, desc: 'Show your commitment' },
    { name: 'Silver', emoji: '🥈', gradient: 'from-zinc-400 to-zinc-300', monthlyPrice: 1000, yearlyPrice: 9600, desc: 'Stand out with silver glow' },
    { name: 'Gold', emoji: '🥇', gradient: 'from-yellow-500 to-yellow-300', monthlyPrice: 2000, yearlyPrice: 19200, desc: 'Premium prestige' },
    { name: 'Diamond', emoji: '💎', gradient: 'from-cyan-300 to-blue-400', monthlyPrice: 5000, yearlyPrice: 48000, desc: 'Legendary status' },
];

function DashboardContent() {
    const [brand, setBrand] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState({ views: 0, productClicks: 0, followers: 0 });

    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') || 'overview';

    const [showGemModal, setShowGemModal] = useState(false);
    const [gemLoading, setGemLoading] = useState(false);
    const [upgradeLoading, setUpgradeLoading] = useState(false);

    useEffect(() => {
        const fetchBrand = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await api.get('/api/auth/me');
                const brandData = res.data.brand;
                setBrand(brandData);
                setAnalytics({
                    views: brandData.views || 0,
                    productClicks: brandData.productClicks || 0,
                    followers: brandData.followers?.length || 0
                });
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBrand();
    }, []);

    const handlePayment = (amount, callback) => {
        const config = {
            public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
            tx_ref: Date.now() + '_' + Math.floor(Math.random() * 1000000),
            amount: amount,
            currency: 'NGN',
            payment_options: 'card,mobilemoney,ussd',
            customer: {
                email: brand.email,
                phone_number: brand.whatsappNumber,
                name: brand.fullName,
            },
            customizations: {
                title: 'myBrand Payment',
                description: 'Service Payment',
                logo: brand.logoUrl || 'https://cdn-icons-png.flaticon.com/512/44/44386.png',
            },
        };

        const handleFW = useFlutterwave(config);

        handleFW({
            callback: (response) => {
                closePaymentModal();
                if (response.status === "successful") {
                    callback(response);
                } else {
                    toast.error("Payment failed or cancelled.");
                }
            },
            onClose: () => { },
        });
    };

    const handleUpgrade = (duration) => {
        setUpgradeLoading(true);
        const price = duration === 'yearly' ? 19200 : 2000;

        handlePayment(price, async (response) => {
            try {
                const res = await api.put('/api/brands/upgrade', { duration, transaction_id: response.transaction_id });
                setBrand(res.data.brand);
                toast.success('🎉 Upgraded to Premium!');
            } catch (err) {
                toast.error('Upgrade failed. Please contact support.');
            } finally {
                setUpgradeLoading(false);
            }
        });
        setUpgradeLoading(false);
    };

    const handleGemPurchase = (gemName, duration) => {
        setGemLoading(true);
        const gem = GEM_TIERS.find(g => g.name === gemName);
        const price = duration === 'yearly' ? gem.yearlyPrice : gem.monthlyPrice;

        handlePayment(price, async (response) => {
            try {
                const res = await api.put('/api/brands/gem', { gem: gemName, duration, transaction_id: response.transaction_id });
                setBrand(res.data.brand);
                toast.success(`${gemName} gem activated! ✨`);
                setShowGemModal(false);
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to activate gem.');
            } finally {
                setGemLoading(false);
            }
        });
        setGemLoading(false);
    };

    const handleTabChange = (tab) => {
        router.push(tab === 'overview' ? '/dashboard' : `/dashboard?tab=${tab}`);
    };

    if (loading) return <div className="flex h-96 items-center justify-center text-zinc-400">Loading dashboard...</div>;
    if (!brand) return null;

    const isPremium = brand.tier === 'Premium';

    const getDaysRemaining = () => {
        if (!brand.subscription?.endDate) return 0;
        const end = new Date(brand.subscription.endDate);
        const now = new Date();
        const diff = end - now;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };
    const daysRemaining = getDaysRemaining();

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
            <Toaster position="top-center" />

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">Dashboard Overview</h1>
                    <p className="text-sm md:text-base text-zinc-500">Welcome back, <span className="font-semibold text-zinc-900">{brand.brandName}</span>.
                        {isPremium && <span className="ml-2 inline-flex items-center text-[10px] md:text-xs font-bold text-[#FF6600] bg-orange-50 px-2 py-0.5 rounded-full ring-1 ring-orange-200">⚡ PREMIUM</span>}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3">
                    <Link href={`/${brand.username}`} target="_blank" className="flex-1 sm:flex-none">
                        <button className="w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-white border border-zinc-200 rounded-lg text-xs md:text-sm font-bold hover:bg-zinc-50 transition-colors text-zinc-700 shadow-sm">
                            <ExternalLink size={16} /> <span className="whitespace-nowrap">View Store</span>
                        </button>
                    </Link>
                    <Link href="/dashboard/products/new" className="flex-1 sm:flex-none">
                        <button className="w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-[#FF6600] text-white rounded-lg text-xs md:text-sm font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
                            <Zap size={16} /> <span className="whitespace-nowrap">Add Product</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Tabs - Scrollable on mobile */}
            <div className="border-b border-zinc-200 -mx-4 md:mx-0 px-4 md:px-0 overflow-x-auto scrollbar-hide">
                <nav className="-mb-px flex space-x-6 md:space-x-8 min-w-max">
                    {['overview', 'products', 'posts', 'billing'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-all capitalize ${activeTab === tab
                                ? 'border-[#FF6600] text-[#FF6600]'
                                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Analytics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {[
                                { label: 'Total Views', value: analytics.views, sub: 'profile visits', icon: <Eye className="text-[#FF6600]" size={20} /> },
                                { label: 'Product Clicks', value: analytics.productClicks, sub: 'WhatsApp redirects', icon: <MousePointerClick className="text-[#FF6600]" size={20} /> },
                                { label: 'Followers', value: analytics.followers, sub: 'brand followers', icon: <Users className="text-[#FF6600]" size={20} /> },
                            ].map((stat) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-zinc-100"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs md:text-sm font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                                        <div className="p-2 bg-orange-50 rounded-xl">{stat.icon}</div>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl md:text-3xl font-black text-zinc-900">{stat.value.toLocaleString()}</span>
                                        <span className="text-[10px] md:text-xs text-zinc-400 font-bold uppercase tracking-tight">{stat.sub}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <RecentClicksTable />

                        <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-zinc-100">
                            <h3 className="text-lg md:text-xl font-black text-zinc-900 mb-6 flex items-center gap-2">
                                <CheckCircle2 className="text-[#FF6600]" size={24} /> Store Setup Progress
                            </h3>
                            <SetupChecklist brand={brand} />
                        </div>
                    </div>
                )}

                {/* PRODUCTS TAB */}
                {activeTab === 'products' && (
                    <ProductsView brand={brand} />
                )}

                {/* POSTS TAB */}
                {activeTab === 'posts' && (
                    <PostsView brand={brand} />
                )}

                {/* BILLING TAB */}
                {activeTab === 'billing' && (
                    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Active Plan Card */}
                        <div className="bg-white p-6 md:p-10 rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
                            <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-8 md:gap-12">
                                <div className="max-w-xl">
                                    <div className="inline-block px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                                        Current Plan
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black text-zinc-900 mb-4">{brand.tier} Plan</h2>
                                    <p className="text-sm md:text-lg text-zinc-500 mb-8 leading-relaxed">
                                        {isPremium
                                            ? "Your brand is currently maximized with premium tools. You have full access to verified badges, status gems, and advanced analytics tracking."
                                            : "You are currently on the Free plan. Upgrade to Premium to unlock verified badges, visibility status gems, and more advanced sales tools."}
                                    </p>

                                    {isPremium && (
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                                            <div className="bg-orange-50 px-5 py-4 rounded-2xl border border-orange-100 flex-1 w-full sm:w-auto">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <Clock size={16} className="text-[#FF6600]" />
                                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Expires In</span>
                                                </div>
                                                <div className="text-2xl font-black text-zinc-900">
                                                    {daysRemaining} <span className="text-xs font-bold text-zinc-400 uppercase ml-1">days</span>
                                                </div>
                                            </div>
                                            <div className="bg-zinc-50 px-5 py-4 rounded-2xl border border-zinc-100 flex-1 w-full sm:w-auto">
                                                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Renewal Date</div>
                                                <div className="text-lg font-bold text-zinc-900 underline decoration-zinc-200 decoration-2 underline-offset-4">
                                                    {new Date(brand.subscription.endDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {!isPremium ? (
                                            <button
                                                onClick={() => handleUpgrade('monthly')}
                                                className="w-full sm:w-auto px-8 py-4 bg-[#FF6600] text-white font-black rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95"
                                            >
                                                Start Premium (₦2,000)
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleUpgrade('monthly')}
                                                className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95"
                                            >
                                                Extend Premium Sub
                                            </button>
                                        )}
                                        <button className="w-full sm:w-auto px-8 py-4 border-2 border-zinc-200 text-zinc-600 font-bold rounded-2xl hover:bg-zinc-50 transition-colors">
                                            Download Receipts
                                        </button>
                                    </div>
                                </div>

                                {/* Status Gems Section */}
                                {isPremium && (
                                    <div className="xl:w-96 bg-zinc-50 rounded-3xl p-6 md:p-8 border border-zinc-200/50 shadow-inner">
                                        <h3 className="font-black text-zinc-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                                            <Gem size={20} className="text-purple-600" /> Active Status Gem
                                        </h3>
                                        <div className="flex items-center gap-5 mb-8">
                                            <div className="w-20 h-20 rounded-3xl bg-white border border-zinc-200 flex items-center justify-center text-4xl shadow-xl rotate-3">
                                                {brand.statusGem === 'None' ? '💎' :
                                                    brand.statusGem === 'Bronze' ? '🥉' :
                                                        brand.statusGem === 'Silver' ? '🥈' :
                                                            brand.statusGem === 'Gold' ? '🥇' : '💎'}
                                            </div>
                                            <div>
                                                <div className="font-black text-xl text-zinc-900 leading-none mb-1">{brand.statusGem} <span className="text-zinc-400">Tier</span></div>
                                                <div className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">
                                                    {brand.statusGem === 'None' ? 'No active gem' : `Glows until ${new Date(brand.gemExpiry).toLocaleDateString()}`}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowGemModal(true)}
                                            className="w-full py-4 bg-white border border-zinc-200 text-zinc-900 text-sm font-black rounded-2xl hover:shadow-lg transition-all active:scale-[0.98]"
                                        >
                                            Upgrade My Gem
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Gem Purchase Modal */}
            <AnimatePresence>
                {showGemModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setShowGemModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-[2.5rem] p-6 md:p-10 max-w-2xl w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-zinc-400 via-yellow-400 to-cyan-400" />
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-black text-zinc-900 mb-2">Select Your Status Gem</h2>
                                <p className="text-zinc-500 text-sm font-medium">This gem will display permanently next to your brand name on your profile</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 max-h-[60vh] overflow-y-auto px-2 scrollbar-hide">
                                {GEM_TIERS.map((gem) => (
                                    <div key={gem.name} className={`relative border-2 rounded-3xl p-5 ${brand.statusGem === gem.name ? 'border-[#FF6600] bg-orange-50/30' : 'border-zinc-100 hover:border-zinc-200'} transition-all`}>
                                        <div className="text-4xl mb-3">{gem.emoji}</div>
                                        <div className={`font-black text-xl bg-gradient-to-r ${gem.gradient} bg-clip-text text-transparent mb-1`}>{gem.name}</div>
                                        <div className="text-zinc-400 text-xs font-bold leading-tight mb-5">{gem.desc}</div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => handleGemPurchase(gem.name, 'monthly')}
                                                disabled={gemLoading}
                                                className="w-full py-2.5 bg-zinc-900 text-white text-xs font-black rounded-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                ₦{gem.monthlyPrice.toLocaleString()} / MONTH
                                            </button>
                                            <button
                                                onClick={() => handleGemPurchase(gem.name, 'yearly')}
                                                disabled={gemLoading}
                                                className="w-full py-2.5 border-2 border-zinc-100 text-zinc-600 text-xs font-black rounded-xl hover:bg-zinc-50 transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                ₦{gem.yearlyPrice.toLocaleString()} / YEAR
                                            </button>
                                        </div>
                                        {brand.statusGem === gem.name && (
                                            <div className="absolute top-4 right-4 text-[#FF6600]">
                                                <CheckCircle2 size={24} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setShowGemModal(false)} className="w-full py-3 text-zinc-400 text-sm font-black hover:text-zinc-600 transition-colors uppercase tracking-widest">
                                Maybe Later
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function DashboardOverview() {
    return (
        <div className="bg-gray-50 min-h-screen">
            <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-zinc-400 font-bold uppercase tracking-widest animate-pulse">Loading dashboard...</div>}>
                <DashboardContent />
            </Suspense>
        </div>
    );
}

function SetupChecklist({ brand }) {
    const checklist = [
        { label: "Create your brand profile", done: true },
        { label: "Add brand logo/identity", done: !!brand.logoUrl },
        { label: "Customize brand theme", done: brand.themeColor && brand.themeColor !== '#000000' },
        { label: "Set contact information", done: !!brand.fullName },
        { label: "Email verification", done: true }
    ];
    const completed = checklist.filter(i => i.done).length;
    const progress = (completed / checklist.length) * 100;

    return (
        <div className="relative">
            <div className="flex justify-between items-end mb-4">
                <div className="text-3xl font-black text-zinc-900">{Math.round(progress)}%</div>
                <div className="text-xs font-black text-zinc-400 uppercase tracking-widest">Profile Completion</div>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-3 mb-8 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-gradient-to-r from-orange-400 to-[#FF6600] h-full rounded-full"
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {checklist.map((item, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${item.done ? 'bg-zinc-50 border-transparent opacity-60' : 'bg-white border-zinc-100 shadow-sm'}`}>
                        <div className={`transition-colors duration-300 ${item.done ? 'text-green-500' : 'text-zinc-300'}`}>
                            {item.done ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </div>
                        <span className={`text-sm md:text-base font-bold ${item.done ? 'text-zinc-400' : 'text-zinc-700'}`}>{item.label}</span>
                    </div>
                ))}
            </div>
            {progress < 100 && (
                <div className="mt-8 pt-8 border-t border-zinc-50">
                    <Link href="/dashboard/settings" className="group flex items-center justify-center gap-2 w-full py-4 bg-zinc-100 text-zinc-600 font-black text-sm rounded-2xl hover:bg-zinc-200 transition-all active:scale-95">
                        Finish Brand Setup <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            )}
        </div>
    )
}

function RecentClicksTable() {
    const [clicks, setClicks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClicks = async () => {
            try {
                const res = await api.get('/api/analytics/clicks');
                setClicks(res.data);
            } catch (err) {
                console.error("Failed to fetch clicks", err);
            } finally {
                setLoading(false);
            }
        };
        fetchClicks();
    }, []);

    if (loading) return <div className="h-64 bg-zinc-50 rounded-[2rem] animate-pulse col-span-full mb-8 shadow-inner" />;
    if (clicks.length === 0) return null;

    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-100 overflow-hidden mb-8">
            <div className="px-6 md:px-8 py-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <h3 className="font-black text-zinc-900 text-lg uppercase tracking-tight">Recent Interactions</h3>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Real-time product interest tracking</p>
                </div>
                <div className="px-3 py-1 bg-zinc-50 rounded-full border border-zinc-200 text-[10px] font-black text-zinc-500 uppercase">
                    Last 50 clicks
                </div>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-sm text-left">
                    <thead className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] bg-zinc-50/50">
                        <tr>
                            <th className="px-8 py-5">Product</th>
                            <th className="px-8 py-5">Price</th>
                            <th className="px-8 py-5">Timestamp</th>
                            <th className="px-8 py-5">Device</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                        {clicks.map((click) => (
                            <tr key={click._id} className="group hover:bg-zinc-50/50 transition-colors">
                                <td className="px-8 py-5 font-bold text-zinc-900 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-100 overflow-hidden flex-shrink-0 border border-zinc-200 shadow-sm group-hover:scale-105 transition-transform">
                                        {click.product?.imageUrl ? (
                                            <img src={click.product.imageUrl} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-200" />
                                        )}
                                    </div>
                                    <span className="truncate max-w-[150px]">{click.product?.name || 'Deleted Product'}</span>
                                </td>
                                <td className="px-8 py-5 text-zinc-600 font-black leading-none">₦{click.product?.price?.toLocaleString() || '0'}</td>
                                <td className="px-8 py-5 text-zinc-400 font-bold whitespace-nowrap text-xs">{new Date(click.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                <td className="px-8 py-5 text-zinc-400 font-black text-[10px] uppercase tracking-widest">
                                    {click.userAgent?.includes('Mobile') ? (
                                        <span className="bg-blue-50 text-blue-500 px-2.5 py-1 rounded-full border border-blue-100 italic">Mobile</span>
                                    ) : (
                                        <span className="bg-zinc-100 text-zinc-500 px-2.5 py-1 rounded-full border border-zinc-200 italic">Desktop</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
