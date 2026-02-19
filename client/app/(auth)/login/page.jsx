'use client';

import React, { useState, useEffect, Suspense } from 'react';
import api from '../../../utils/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { LogIn, Mail, Lock } from 'lucide-react';

// Simple Soft Click Sound
const playSoftClick = () => {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
        // Audio not supported or blocked
    }
};

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const redirectPath = searchParams.get('redirect') || '/dashboard';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleInteraction = () => {
        playSoftClick();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        playSoftClick();
        setLoading(true);

        try {
            const res = await api.post('/api/auth/login', formData);
            localStorage.setItem('token', res.data.token);

            // Confetti celebration
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FF6600', '#000000', '#ffffff']
            });

            toast.success('Welcome back! Redirecting...');

            setTimeout(() => {
                router.push(decodeURIComponent(redirectPath));
            }, 1000);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.msg || 'Login failed. Please check your credentials.');
            setLoading(false); // Only stop loading on error, on success keep it until redirect
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[var(--primary)] selection:text-white">
            <Toaster position="top-center" toastOptions={{
                style: {
                    background: '#fff',
                    color: '#333',
                    border: '1px solid #e5e5e5',
                },
                success: {
                    iconTheme: {
                        primary: '#FF6600',
                        secondary: '#fff',
                    },
                },
            }} />

            <div className="text-center mb-8">
                <Link href="/" onClick={handleInteraction}>
                    <motion.h1
                        className="text-4xl font-extrabold tracking-tight text-zinc-900"
                        whileHover={{ scale: 1.05 }}
                    >
                        my<span className="text-[var(--primary)]">Brand</span>
                    </motion.h1>
                </Link>
                <p className="mt-2 text-zinc-500">Welcome back! Log in to your account</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-orange-50 rounded-xl">
                            <LogIn className="text-[var(--primary)]" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-900">Sign In</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-zinc-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onFocus={handleInteraction}
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-zinc-300 rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] text-zinc-900 placeholder-zinc-400 transition-shadow"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-zinc-400" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={handleInteraction}
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-zinc-300 rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] text-zinc-900 placeholder-zinc-400 transition-shadow"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleInteraction}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-black hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white"></span>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-zinc-500">New to myBrand?</span>
                        </div>
                    </div>

                    {/* Register Link */}
                    <Link href="/register" onClick={handleInteraction}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            className="w-full flex justify-center py-3 px-4 border border-zinc-300 rounded-lg shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-colors"
                        >
                            Create an Account
                        </motion.button>
                    </Link>
                </div>

                <div className="px-8 py-4 bg-zinc-50 border-t border-zinc-200 text-center">
                    <p className="text-sm text-zinc-600">
                        <Link href="/" className="hover:text-[var(--primary)] transition-colors inline-flex items-center gap-1" onClick={handleInteraction}>
                            ← Back to Home
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

export default function Login() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}