'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        brandName: '',
        email: '',
        password: '',
        whatsappNumber: '',
        username: '', // Subdomain
        tier: 'Free',
        cacRegistered: false,
        cacNumber: ''
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNext = (e) => {
        e.preventDefault();
        setStep(prev => prev + 1);
    };

    const handlePrev = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, formData);
            // Save token
            localStorage.setItem('token', res.data.token);
            // Redirect to dashboard
            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your brand
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Step {step} of 3
                    </p>
                </div>

                {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

                <form className="mt-8 space-y-6" onSubmit={step === 3 ? handleSubmit : handleNext}>

                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Brand Name</label>
                                <input
                                    name="brandName"
                                    type="text"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                    value={formData.brandName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                                <input
                                    name="whatsappNumber"
                                    type="tel"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                    value={formData.whatsappNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Brand Identity */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Choose your Subdomain</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-black focus:border-black sm:text-sm border-gray-300"
                                        placeholder="yourbrand"
                                        value={formData.username}
                                        onChange={handleChange}
                                    />
                                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                        .mybrand.com
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="cacRegistered"
                                        name="cacRegistered"
                                        type="checkbox"
                                        className="focus:ring-black h-4 w-4 text-black border-gray-300 rounded"
                                        checked={formData.cacRegistered}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="cacRegistered" className="font-medium text-gray-700">Business is registered with CAC</label>
                                </div>
                            </div>

                            {formData.cacRegistered && (
                                <div className="animate-fade-in-down">
                                    <label className="block text-sm font-medium text-gray-700">RC or BN Number</label>
                                    <input
                                        name="cacNumber"
                                        type="text"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                        value={formData.cacNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Tier Selection */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select a Plan</label>
                            <div className="grid grid-cols-1 gap-3">
                                {['Free', '1k', '2k', '3k', '5k'].map((tier) => (
                                    <div
                                        key={tier}
                                        onClick={() => setFormData(prev => ({ ...prev, tier }))}
                                        className={`cursor-pointer rounded-lg border p-4 flex items-center justify-between hover:border-black transition-colors ${formData.tier === tier ? 'border-2 border-black bg-gray-50' : 'border-gray-200'}`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center mr-3 ${formData.tier === tier ? 'border-black' : 'border-gray-300'}`}>
                                                {formData.tier === tier && <div className="h-2 w-2 rounded-full bg-black" />}
                                            </div>
                                            <span className="font-medium text-gray-900">{tier === 'Free' ? 'Free Plan' : `${tier} Plan`}</span>
                                        </div>
                                        <span className="text-gray-500 text-sm">{tier === 'Free' ? '₦0/mo' : `₦${tier.replace('k', ',000')}/mo`}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between space-x-3">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={handlePrev}
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                            >
                                Back
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Processing...' : step === 3 ? 'Create Account' : 'Next'}
                        </button>
                    </div>
                </form>
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Already have an account? <Link href="/login" className="font-medium text-black hover:text-gray-800">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
