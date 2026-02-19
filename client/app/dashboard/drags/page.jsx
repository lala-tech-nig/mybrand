'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Flame, MessageSquare, Send, User, TrendingUp, Clock, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DragsPage() {
    const [activeTab, setActiveTab] = useState('feed'); // feed, mentions, my-drags
    const [sortBy, setSortBy] = useState('latest'); // latest, trending
    const [drags, setDrags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newDragContent, setNewDragContent] = useState('');
    const [targetBrand, setTargetBrand] = useState('');
    const [brand, setBrand] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        fetchBrand();
    }, []);

    useEffect(() => {
        if (brand) {
            fetchDrags();
        }
    }, [activeTab, brand, sortBy]);

    const fetchBrand = async () => {
        try {
            const res = await api.get('/api/auth/me');
            setBrand(res.data.brand);
        } catch (err) {
            console.error("Auth error", err);
        }
    };

    const fetchDrags = async () => {
        setLoading(true);
        try {
            let url = `/api/drags?sort=${sortBy}`;
            if (activeTab === 'mentions') url = `/api/drags/target/${brand._id}`;
            if (activeTab === 'my-drags') url = `/api/drags/author/${brand._id}`;

            const res = await api.get(url);
            setDrags(res.data);
        } catch (err) {
            console.error("Failed to fetch drags", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTargetChange = async (e) => {
        const val = e.target.value;
        setTargetBrand(val);

        if (val.length > 1) {
            try {
                const res = await api.get(`/api/brands/search?query=${val}`);
                setSuggestions(res.data);
                setShowSuggestions(true);
            } catch (err) {
                console.error(err);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectSuggestion = (b) => {
        setTargetBrand(b.brandName);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handlePostDrag = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/drags', {
                content: newDragContent,
                targetBrandName: targetBrand
            });
            setNewDragContent('');
            setTargetBrand('');
            fetchDrags(); // Refresh
            alert('Drag posted successfully!');
        } catch (err) {
            alert('Failed to post drag');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-2">
                        <Flame className="text-[#FF6600]" fill="#FF6600" /> Drags & Accountability
                    </h1>
                    <p className="text-zinc-500">Call out bad service or praise good accountability.</p>
                </div>

                {activeTab === 'feed' && (
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-zinc-200">
                        <button
                            onClick={() => setSortBy('latest')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${sortBy === 'latest' ? 'bg-black text-white shadow-sm' : 'text-zinc-500 hover:text-black'}`}
                        >
                            <Clock size={14} /> Latest
                        </button>
                        <button
                            onClick={() => setSortBy('trending')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${sortBy === 'trending' ? 'bg-[#FF6600] text-white shadow-sm' : 'text-zinc-500 hover:text-[#FF6600]'}`}
                        >
                            <TrendingUp size={14} /> Trending
                        </button>
                    </div>
                )}
            </div>

            {/* Create Drag Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6600]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <User size={18} className="text-zinc-400" /> Start a Drag
                </h3>
                <form onSubmit={handlePostDrag} className="space-y-4 relative z-10">
                    <div>
                        <input
                            type="text"
                            placeholder="@TargetBrand (Leaving empty means general shoutout)"
                            className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-[#FF6600] focus:border-[#FF6600] text-sm bg-zinc-50/50"
                            value={targetBrand}
                            onChange={handleTargetChange}
                            autocomplete="off"
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-zinc-200 rounded-xl shadow-lg mt-1 z-50 max-h-48 overflow-y-auto">
                                {suggestions.map((s) => (
                                    <button
                                        key={s._id}
                                        type="button"
                                        onClick={() => selectSuggestion(s)}
                                        className="w-full text-left px-4 py-2 hover:bg-zinc-50 flex items-center gap-2"
                                    >
                                        <div className="h-6 w-6 rounded-full bg-zinc-100 overflow-hidden">
                                            {s.logoUrl && <img src={s.logoUrl} alt="" className="h-full w-full object-cover" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">{s.brandName}</p>
                                            <p className="text-xs text-zinc-500">@{s.username}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <textarea
                            placeholder="What happened? Keep it factual. Truth sets everyone free."
                            className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-[#FF6600] focus:border-[#FF6600] text-sm min-h-[100px] bg-zinc-50/50 resize-none"
                            value={newDragContent}
                            onChange={(e) => setNewDragContent(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg text-sm font-bold hover:bg-zinc-800 transition-all hover:scale-105 shadow-lg shadow-black/10">
                            <Flame size={16} className="text-[#FF6600]" fill="#FF6600" />
                            Post Drag
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-200 sticky top-0 bg-gray-50 z-20 pt-4">
                <TabButton active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} label="Global Feed" />
                <TabButton active={activeTab === 'mentions'} onClick={() => setActiveTab('mentions')} label="Mentions (On Me)" />
                <TabButton active={activeTab === 'my-drags'} onClick={() => setActiveTab('my-drags')} label="My Drags" />
            </div>

            {/* Feed */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6600]"></div>
                    </div>
                ) : drags.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-200">
                        <Flame size={48} className="mx-auto text-zinc-200 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-900">No drags found</h3>
                        <p className="text-zinc-500">The coast is clear... for now.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {drags.map((drag, index) => (
                            <DragCard key={drag._id} drag={drag} index={index} />
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors relative ${active ? 'border-[#FF6600] text-[#FF6600]' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
        >
            {label}
            {active && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6600]"
                />
            )}
        </button>
    );
}

function DragCard({ drag, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-md transition-shadow"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-zinc-100 rounded-full flex items-center justify-center overflow-hidden border border-zinc-100">
                        {drag.author?.logoUrl ? (
                            <img src={drag.author.logoUrl} alt={drag.author.username} className="h-full w-full object-cover" />
                        ) : (
                            <User size={24} className="text-zinc-300" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-zinc-900 leading-tight">{drag.author?.brandName || 'Unknown Brand'}</p>
                            {drag.author?.isVerified && <span className="text-blue-500 text-[10px] sm:text-xs bg-blue-50 px-1.5 py-0.5 rounded-full font-medium">Verified</span>}
                        </div>
                        <p className="text-xs text-zinc-500">@{drag.author?.username || 'unknown'}</p>
                    </div>
                </div>
                <span className="text-xs text-zinc-400 font-medium bg-zinc-50 px-2 py-1 rounded-full">{new Date(drag.createdAt).toLocaleDateString()}</span>
            </div>

            <p className="text-zinc-800 leading-relaxed mb-4 whitespace-pre-wrap text-[15px]">{drag.content}</p>

            {drag.targetBrandName && (
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100">
                    <Flame size={12} fill="currentColor" />
                    Target: {drag.targetBrandName}
                </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                <div className="flex gap-4">
                    <button className="flex items-center gap-1.5 text-zinc-500 hover:text-[#FF6600] text-xs font-medium transition-colors group">
                        <MessageSquare size={16} className="group-hover:scale-110 transition-transform" />
                        {drag.comments.length || 0} Comments
                    </button>
                    {/* Add Like Button here later */}
                </div>

                <button className="text-xs font-medium text-zinc-400 hover:text-black transition-colors">
                    View Details
                </button>
            </div>
        </motion.div>
    );
}
