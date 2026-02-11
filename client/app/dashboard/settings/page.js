'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        brandName: '',
        description: '',
        themeColor: '#000000',
        logoUrl: '',
        coverUrl: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                headers: { 'x-auth-token': token }
            })
                .then(res => {
                    const { brandName, description, themeColor, logoUrl, coverUrl } = res.data.brand;
                    setFormData({
                        brandName: brandName || '',
                        description: description || '',
                        themeColor: themeColor || '#000000',
                        logoUrl: logoUrl || '',
                        coverUrl: coverUrl || ''
                    });
                })
                .catch(err => console.error(err));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/brands/settings`, formData, {
                headers: { 'x-auth-token': token }
            });
            setSuccess('Settings updated successfully!');
            // Reload page or re-fetch could be better, but simple is ok
            window.location.reload();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Brand Settings</h1>

            {success && <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">{success}</div>}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6 max-w-2xl">

                {/* Visual Identity */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Visual Identity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    name="themeColor"
                                    value={formData.themeColor}
                                    onChange={handleChange}
                                    className="h-10 w-20 p-1 rounded border border-gray-300 cursor-pointer"
                                />
                                <span className="text-sm text-gray-500">{formData.themeColor}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* URLs */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Images (URLs)</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Logo URL</label>
                            <input
                                type="url"
                                name="logoUrl"
                                value={formData.logoUrl}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cover Image URL</label>
                            <input
                                type="url"
                                name="coverUrl"
                                value={formData.coverUrl}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div>
                    <h3 className="text-lg font-medium mb-4">Profile Info</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bio / Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
