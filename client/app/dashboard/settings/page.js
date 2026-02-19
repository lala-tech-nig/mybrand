'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Upload, User, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import PaymentModal from '../../components/PaymentModal';

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        brandName: '',
        fullName: '',
        description: '',
        themeColor: '#000000',
    });
    const [logoFile, setLogoFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [previewLogo, setPreviewLogo] = useState('');
    const [previewCover, setPreviewCover] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {

            api.get('/api/auth/me')
                .then(res => {
                    const { brandName, fullName, description, themeColor, logoUrl, coverUrl } = res.data.brand;
                    setFormData({
                        brandName: brandName || '',
                        fullName: fullName || '',
                        description: description || '',
                        themeColor: themeColor || '#000000',
                    });
                    if (logoUrl) setPreviewLogo(logoUrl);
                    if (coverUrl) setPreviewCover(coverUrl);
                })
                .catch(err => console.error(err));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'logo') {
                setLogoFile(file);
                setPreviewLogo(URL.createObjectURL(file));
            } else {
                setCoverFile(file);
                setPreviewCover(URL.createObjectURL(file));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            data.append('brandName', formData.brandName);
            data.append('fullName', formData.fullName);
            data.append('description', formData.description);
            data.append('themeColor', formData.themeColor);

            if (logoFile) data.append('logo', logoFile);

            if (coverFile) data.append('cover', coverFile);

            await api.put('/api/brands/settings', data);
            setSuccess('Settings updated successfully!');
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold mb-6 text-zinc-900">Brand Settings</h1>

            {success && <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-100">{success}</div>}

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-zinc-100 space-y-8">

                {/* Brand Identity */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-zinc-900 pb-2 border-b border-zinc-100">Brand Identity</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">Logo</label>
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center">
                                    {previewLogo ? (
                                        <img src={previewLogo} alt="Logo" className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="text-zinc-300" />
                                    )}
                                </div>
                                <label className="cursor-pointer px-4 py-2 border border-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">
                                    Change Logo
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">Brand Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    name="themeColor"
                                    value={formData.themeColor}
                                    onChange={handleChange}
                                    className="h-10 w-20 p-1 rounded border border-zinc-300 cursor-pointer"
                                />
                                <span className="text-sm text-zinc-500 uppercase">{formData.themeColor}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-2">Cover Image</label>
                        <div className="relative h-32 w-full bg-zinc-100 rounded-lg border border-zinc-200 overflow-hidden group">
                            {previewCover ? (
                                <img src={previewCover} alt="Cover" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-zinc-400">
                                    <ImageIcon size={24} />
                                </div>
                            )}
                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white font-medium">
                                <Upload size={20} className="mr-2" /> Upload Cover
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Profile Info */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-zinc-900 pb-2 border-b border-zinc-100">Profile Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Brand Name</label>
                            <input
                                type="text"
                                name="brandName"
                                value={formData.brandName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-black focus:border-black text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-black focus:border-black text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Bio / Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-black focus:border-black text-sm"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-black text-white px-8 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 font-medium"
                    >
                        {loading ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            <div className="mt-8 bg-black text-white p-8 rounded-xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-[#FF6600] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="text-[#FF6600]">PRO</span> Subscription
                </h2>

                <div className="grid md:grid-cols-2 gap-8 relative z-10">
                    <div>
                        <p className="text-zinc-400 mb-2">Current Plan</p>
                        <h3 className="text-3xl font-black">{formData.tier || 'Free'} Plan</h3>
                        <p className="text-sm text-zinc-500 mt-1">Upgrade to unlock more features and badges.</p>
                    </div>

                    <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/10">
                        <h4 className="font-bold mb-4">Upgrade to Premium</h4>
                        <ul className="space-y-2 text-sm text-zinc-300 mb-6">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#FF6600] rounded-full"></div> Verified Badge</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#FF6600] rounded-full"></div> Priority Support</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#FF6600] rounded-full"></div> Advanced Analytics</li>
                        </ul>
                        <PaymentModal
                            brand={{ ...formData, email: 'user@example.com', whatsappNumber: '0800000000' }} // Would need actual email/phone in formData or fetch
                            amount={5000}
                            planName="Premium"
                            onIsSuccessful={() => {
                                setSuccess("Payment Successful! Welcome to Premium.");
                                confetti({ particleCount: 200, spread: 100 });
                                // Call backend to update tier
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
