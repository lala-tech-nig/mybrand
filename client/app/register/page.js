'use client';

import React, { useState } from 'react';
import api from '../../utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, CheckCircle, Store, User, CreditCard, ShieldCheck } from 'lucide-react';

import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

export default function Register() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        brandName: '',
        email: '',
        password: '',
        whatsappNumber: '',
        username: '', // Subdomain
        tier: 'Free',
        cacRegistered: false,
        cacNumber: '',
        logo: null
    });

    const [error, setError] = useState('');

    const config = {
        public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: Date.now(),
        amount: 2000,
        currency: 'NGN',
        payment_options: 'card,mobilemoney,ussd',
        customer: {
            email: formData.email,
            phone_number: formData.whatsappNumber,
            name: formData.fullName,
        },
        customizations: {
            title: 'myBrand Premium',
            description: 'Premium Subscription (₦2,000/mo)',
            logo: 'https://cdn-icons-png.flaticon.com/512/44/44386.png',
        },
    };

    const handleFlutterwavePayment = useFlutterwave(config);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            const file = files[0];
            setFormData(prev => ({ ...prev, [name]: file }));
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setLogoPreview(reader.result);
                reader.readAsDataURL(file);
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleNext = (e) => {
        e.preventDefault();
        setStep(prev => prev + 1);
    };

    const handlePrev = () => {
        setStep(prev => prev - 1);
    };

    const submitRegistration = async (transaction_id = null) => {
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            if (transaction_id) {
                data.append('transaction_id', transaction_id);
            }

            const res = await api.post('/api/auth/register', data);

            localStorage.setItem('token', res.data.token);
            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.tier === 'Premium') {
            handleFlutterwavePayment({
                callback: (response) => {
                    closePaymentModal();
                    if (response.status === "successful") {
                        submitRegistration(response.transaction_id);
                    } else {
                        setLoading(false);
                        toast.error("Payment failed. Please try again.");
                    }
                },
                onClose: () => {
                    setLoading(false);
                },
            });
        } else {
            submitRegistration();
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">
                    my<span className="text-[var(--primary)]">Brand</span>
                </h1>
                <p className="mt-2 text-zinc-500">Launch your digital storefront in minutes.</p>
            </div>

            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Progress Bar */}
                <div className="bg-zinc-100 h-2 w-full">
                    <div
                        className="h-full bg-[var(--primary)] transition-all duration-500 ease-in-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="p-8 md:p-12">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-zinc-900">
                            {step === 1 && "Let's start with your identity"}
                            {step === 2 && "Setup your business profile"}
                            {step === 3 && "Choose your growth plan"}
                        </h2>
                        <p className="text-sm text-zinc-500 mt-1">
                            Step {step} of 3
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={step === 3 ? handleSubmit : handleNext} className="space-y-6">

                        {/* Step 1: Personal & Account Info */}
                        {step === 1 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-zinc-400" />
                                            </div>
                                            <input
                                                name="fullName"
                                                type="text"
                                                required
                                                className="block w-full pl-10 pr-3 py-3 border border-zinc-300 rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] text-zinc-900 placeholder-zinc-400"
                                                placeholder="John Doe"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">WhatsApp Number</label>
                                        <input
                                            name="whatsappNumber"
                                            type="tel"
                                            required
                                            className="block w-full px-3 py-3 border border-zinc-300 rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] text-zinc-900 placeholder-zinc-400"
                                            placeholder="+234..."
                                            value={formData.whatsappNumber}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Email Address</label>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="block w-full px-3 py-3 border border-zinc-300 rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] text-zinc-900 placeholder-zinc-400"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        className="block w-full px-3 py-3 border border-zinc-300 rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] text-zinc-900 placeholder-zinc-400"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Brand Profile */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Brand Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Store className="h-5 w-5 text-zinc-400" />
                                        </div>
                                        <input
                                            name="brandName"
                                            type="text"
                                            required
                                            className="block w-full pl-10 pr-3 py-3 border border-zinc-300 rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] text-zinc-900 placeholder-zinc-400"
                                            placeholder="My Awesome Brand"
                                            value={formData.brandName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Subdomain</label>
                                    <div className="flex rounded-lg shadow-sm">
                                        <input
                                            type="text"
                                            name="username"
                                            required
                                            className="flex-1 min-w-0 block w-full px-3 py-3 rounded-l-lg border border-zinc-300 focus:ring-[var(--primary)] focus:border-[var(--primary)] text-zinc-900 placeholder-zinc-400"
                                            placeholder="mybrand"
                                            value={formData.username}
                                            onChange={handleChange}
                                        />
                                        <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-zinc-300 bg-zinc-50 text-zinc-500 text-sm font-medium">
                                            .mybrand.com.ng
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Brand Logo (Optional)</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-300 border-dashed rounded-lg hover:border-zinc-400 transition-colors">
                                        <div className="space-y-1 text-center">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo Preview" className="mx-auto h-24 w-24 rounded-full object-cover mb-3" />
                                            ) : (
                                                <Upload className="mx-auto h-12 w-12 text-zinc-400" />
                                            )}
                                            <div className="flex text-sm text-zinc-600 justify-center">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[var(--primary)] hover:text-orange-500 focus-within:outline-none">
                                                    <span>Upload a file</span>
                                                    <input id="file-upload" name="logo" type="file" className="sr-only" onChange={handleChange} accept="image/*" />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-zinc-500">PNG, JPG, GIF up to 5MB</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="cacRegistered"
                                                name="cacRegistered"
                                                type="checkbox"
                                                className="focus:ring-[var(--primary)] h-4 w-4 text-[var(--primary)] border-zinc-300 rounded"
                                                checked={formData.cacRegistered}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="cacRegistered" className="font-medium text-zinc-900">Business is registered with CAC</label>
                                            <p className="text-zinc-500">Get a verification badge on your profile.</p>
                                        </div>
                                    </div>
                                    {formData.cacRegistered && (
                                        <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                            <label className="block text-sm font-medium text-zinc-700 mb-1">RC or BN Number</label>
                                            <input
                                                name="cacNumber"
                                                type="text"
                                                className="block w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm"
                                                placeholder="RC 123456"
                                                value={formData.cacNumber}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Pricing */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Free Plan */}
                                    <div
                                        onClick={() => setFormData(prev => ({ ...prev, tier: 'Free' }))}
                                        className={`cursor-pointer relative rounded-xl border-2 p-6 flex flex-col justify-between transition-all duration-200 ${formData.tier === 'Free' ? 'border-[var(--primary)] bg-orange-50 shadow-md transform scale-105' : 'border-zinc-200 hover:border-zinc-300'}`}
                                    >
                                        <div className="absolute top-4 right-4">
                                            {formData.tier === 'Free' ? <CheckCircle className="h-6 w-6 text-[var(--primary)]" /> : <div className="h-6 w-6 rounded-full border-2 border-zinc-300" />}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-zinc-900">Free Plan</h3>
                                            <p className="text-3xl font-extrabold text-zinc-900 mt-2">₦0<span className="text-sm font-medium text-zinc-500">/mo</span></p>
                                            <p className="text-sm text-zinc-500 mt-4">Essential tools to get started.</p>
                                        </div>
                                        <ul className="mt-6 space-y-3 text-sm text-zinc-600">
                                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-zinc-400" /> Basic Profile</li>
                                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-zinc-400" /> 5 Products</li>
                                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-zinc-400" /> Standard Support</li>
                                        </ul>
                                    </div>

                                    {/* Premium Plan */}
                                    <div
                                        onClick={() => setFormData(prev => ({ ...prev, tier: 'Premium' }))}
                                        className={`cursor-pointer relative rounded-xl border-2 p-6 flex flex-col justify-between transition-all duration-200 ${formData.tier === 'Premium' ? 'border-[var(--primary)] bg-orange-50 shadow-md transform scale-105' : 'border-zinc-200 hover:border-zinc-300'}`}
                                    >
                                        <div className="absolute top-0 right-0 bg-black text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">POPULAR</div>
                                        <div className="absolute top-4 right-4">
                                            {formData.tier === 'Premium' ? <CheckCircle className="h-6 w-6 text-[var(--primary)]" /> : <div className="h-6 w-6 rounded-full border-2 border-zinc-300" />}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-zinc-900">Premium Plan</h3>
                                            <p className="text-3xl font-extrabold text-zinc-900 mt-2">₦2,000<span className="text-sm font-medium text-zinc-500">/mo</span></p>
                                            <p className="text-sm text-zinc-500 mt-4">Unleash full potential.</p>
                                        </div>
                                        <ul className="mt-6 space-y-3 text-sm text-zinc-600">
                                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-[var(--primary)]" /> Verified Badge</li>
                                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-[var(--primary)]" /> Unlimited Products</li>
                                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-[var(--primary)]" /> Status Gems & Sliding Banners</li>
                                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-[var(--primary)]" /> Analytics & Priority Support</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-6 flex justify-between space-x-4">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={handlePrev}
                                    className="w-full flex justify-center py-3 px-4 border border-zinc-300 rounded-lg shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-colors"
                                >
                                    Back
                                </button>
                            ) : <div></div>}

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                            >
                                {loading ? 'Processing...' : step === 3 ? 'Create Account' : 'Continue'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="px-8 py-4 bg-zinc-50 border-t border-zinc-200 text-center">
                    <p className="text-sm text-zinc-600">
                        Already have an account? <Link href="/login" className="font-medium text-[var(--primary)] hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
