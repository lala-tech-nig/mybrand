'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export default function DashboardOverview() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Welcome to your brand control center.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Views" value="0" change="-- this week" />
                <StatCard title="Product Clicks" value="0" change="-- this week" />
                <StatCard title="Followers" value="0" change="-- this week" />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4">Getting Started</h3>
                <div className="space-y-3">
                    <CheckItem checked={true} text="Create your account" />
                    <CheckItem checked={false} text="Upload your logo in Settings" />
                    <CheckItem checked={false} text="Set your brand color in Settings" />
                    <CheckItem checked={false} text="Add your first product" />
                    <CheckItem checked={false} text="Post your first update" />
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{value}</span>
                <span className="text-xs text-gray-400 font-medium">{change}</span>
            </div>
        </div>
    );
}

function CheckItem({ checked, text }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${checked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {checked && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className={`text-sm ${checked ? 'text-gray-900 line-through opacity-50' : 'text-gray-700'}`}>{text}</span>
        </div>
    );
}
