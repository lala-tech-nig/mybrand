'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, ShieldCheck, ArrowRight, Gem, Star, Image } from 'lucide-react';

const GEM_TIERS = [
    { name: 'Bronze', color: '#CD7F32', gradient: 'from-amber-700 to-amber-500', price: 500, yearlyPrice: 4800, icon: '🥉', desc: 'Show your commitment to the platform' },
    { name: 'Silver', color: '#C0C0C0', gradient: 'from-zinc-400 to-zinc-300', price: 1000, yearlyPrice: 9600, icon: '🥈', desc: 'Stand out with a sleek silver glow' },
    { name: 'Gold', color: '#FFD700', gradient: 'from-yellow-500 to-yellow-300', price: 2000, yearlyPrice: 19200, icon: '🥇', desc: 'Premium prestige for top brands' },
    { name: 'Diamond', color: '#B9F2FF', gradient: 'from-cyan-300 to-blue-400', price: 5000, yearlyPrice: 48000, icon: '💎', desc: 'Legendary status — elite brands only' },
];

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState('monthly');

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-[#FF6600] selection:text-white overflow-x-hidden">
            <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-20">
                <Link href="/">
                    <h1 className="text-2xl font-black tracking-tighter">
                        my<span className="text-[#FF6600]">Brand</span>.
                    </h1>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">Login</Link>
                    <Link href="/register" className="bg-white text-black px-5 py-2 rounded-full font-bold hover:bg-zinc-200 transition-colors">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Background */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#FF6600] opacity-10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 py-16 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black tracking-tight mb-6"
                    >
                        Simple Pricing.<br />
                        <span className="text-zinc-500">No hidden fees.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-zinc-400"
                    >
                        Start for free and unlock powerful tools as your brand grows.
                    </motion.p>

                    {/* Billing Toggle */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-center gap-4 mt-8"
                    >
                        <span className={`text-sm font-bold transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-zinc-500'}`}>Monthly</span>
                        <button
                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                            className={`relative w-14 h-7 rounded-full transition-colors ${billingCycle === 'yearly' ? 'bg-[#FF6600]' : 'bg-zinc-700'}`}
                        >
                            <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'}`} />
                        </button>
                        <span className={`text-sm font-bold transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-zinc-500'}`}>Yearly</span>
                        {billingCycle === 'yearly' && (
                            <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Save 20%</span>
                        )}
                    </motion.div>
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
                    {/* Free Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-colors"
                    >
                        <h3 className="text-2xl font-bold mb-2">Starter</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-5xl font-black">Free</span>
                            <span className="text-zinc-500">/forever</span>
                        </div>
                        <p className="text-zinc-400 mb-8 h-12">Perfect for side hustles and just getting started with your digital presence.</p>

                        <Link href="/register">
                            <button className="w-full py-4 rounded-xl border border-white/20 font-bold hover:bg-white/5 transition-colors mb-8">
                                Start for Free
                            </button>
                        </Link>

                        <div className="space-y-4">
                            <Feature text="Basic Brand Profile" />
                            <Feature text="Up to 5 Products" />
                            <Feature text="Standard Support" />
                            <Feature text="Mobile Optimized Store" />
                            <Feature text="Direct WhatsApp Checkout" />
                            <FeatureMissing text="Verified Business Badge" />
                            <FeatureMissing text="Status Gems" />
                            <FeatureMissing text="Multiple Banner Images" />
                        </div>
                    </motion.div>

                    {/* Premium Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-zinc-900 border border-[#FF6600]/50 rounded-3xl p-8 relative overflow-hidden shadow-[0_0_60px_rgba(255,102,0,0.12)]"
                    >
                        <div className="absolute top-0 right-0 bg-[#FF6600] text-white text-xs font-bold px-4 py-1 rounded-bl-xl">MOST POPULAR</div>
                        <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#FF6600] rounded-full blur-[100px] opacity-10 pointer-events-none" />

                        <h3 className="text-2xl font-bold mb-2 inline-flex items-center gap-2">
                            Premium <Zap size={20} className="text-[#FF6600] fill-[#FF6600]" />
                        </h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-5xl font-black">
                                ₦{billingCycle === 'yearly' ? '1,600' : '2,000'}
                            </span>
                            <span className="text-zinc-500">/month</span>
                        </div>
                        {billingCycle === 'yearly' && (
                            <p className="text-green-400 text-sm font-medium mb-2">Billed ₦19,200/year — Save ₦4,800!</p>
                        )}
                        <p className="text-zinc-400 mb-8 h-12">For serious brands ready to scale and build a loyal, verified audience.</p>

                        <Link href="/register">
                            <button className="w-full py-4 rounded-xl bg-[#FF6600] text-white font-bold hover:bg-[#ff8533] transition-colors shadow-lg shadow-[#ff6600]/20 mb-8 flex items-center justify-center gap-2">
                                Get Premium Now <ArrowRight size={18} />
                            </button>
                        </Link>

                        <div className="space-y-4">
                            <Feature text="Verified Business Badge ✓" highlight />
                            <Feature text="Unlimited Products" highlight />
                            <Feature text="Multiple Sliding Banner Images (up to 5)" highlight />
                            <Feature text="Status Gems (Bronze → Diamond)" highlight />
                            <Feature text="Advanced Analytics Dashboard" highlight />
                            <Feature text="Priority 24/7 Support" />
                            <Feature text="Custom Brand Color Theme" />
                            <Feature text="Remove 'Powered by' Branding" />
                        </div>
                    </motion.div>
                </div>

                {/* Status Gems Section */}
                <div className="max-w-5xl mx-auto mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold mb-6">
                            <Gem size={14} /> Premium Add-Ons
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                            Status Gems
                        </h2>
                        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                            Flex your brand's prestige. Available exclusively to Premium members — your gem glows next to your brand name.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {GEM_TIERS.map((gem, i) => (
                            <motion.div
                                key={gem.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="bg-zinc-900 border border-white/10 rounded-2xl p-6 text-center hover:border-white/20 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity"
                                    style={{ background: `radial-gradient(circle, ${gem.color}, transparent)` }}
                                />
                                <div className="text-5xl mb-4">{gem.icon}</div>
                                <h3 className={`text-xl font-black mb-2 bg-gradient-to-r ${gem.gradient} bg-clip-text text-transparent`}>
                                    {gem.name}
                                </h3>
                                <p className="text-zinc-500 text-sm mb-4">{gem.desc}</p>
                                <div className="space-y-1">
                                    <div className="text-white font-bold text-lg">
                                        ₦{gem.price.toLocaleString()}<span className="text-zinc-500 text-sm font-normal">/mo</span>
                                    </div>
                                    <div className="text-zinc-500 text-xs">
                                        or ₦{gem.yearlyPrice.toLocaleString()}/year
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* FAQ / CTA */}
                <div className="mt-12 text-center">
                    <p className="text-zinc-500 mb-4">Have questions?</p>
                    <a href="mailto:support@mybrand.com.ng" className="text-white hover:text-[#FF6600] underline underline-offset-4">
                        Contact our support team
                    </a>
                </div>
            </div>
        </div>
    );
}

function Feature({ text, highlight }) {
    return (
        <div className="flex items-center gap-3">
            <CheckCircle size={20} className={highlight ? "text-[#FF6600]" : "text-zinc-600"} />
            <span className={highlight ? "text-white font-medium" : "text-zinc-400"}>{text}</span>
        </div>
    );
}

function FeatureMissing({ text }) {
    return (
        <div className="flex items-center gap-3 opacity-40">
            <div className="w-5 h-5 rounded-full border-2 border-zinc-700 flex-shrink-0" />
            <span className="text-zinc-500 line-through">{text}</span>
        </div>
    );
}
