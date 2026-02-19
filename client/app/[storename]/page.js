'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../utils/api';
import { ShoppingBag, MessageSquare, Heart, Share2, Phone, UserPlus, Check, Eye, MousePointerClick, ShieldCheck, ShieldX, ChevronLeft, ChevronRight, Send, CornerDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const GEM_ICONS = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Diamond: '💎' };

// ── Cover Image Carousel (Premium Feature) ──────────────────────────────────
function CoverCarousel({ images, fallback }) {
    const [current, setCurrent] = useState(0);
    const allImages = images?.length > 0 ? images : (fallback ? [fallback] : []);
    const isMulti = allImages.length > 1;

    useEffect(() => {
        if (!isMulti) return;
        const timer = setInterval(() => setCurrent(p => (p + 1) % allImages.length), 4000);
        return () => clearInterval(timer);
    }, [allImages.length, isMulti]);

    if (allImages.length === 0) {
        return (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                <div className="w-full h-full bg-gradient-to-b from-transparent to-black/80" />
            </div>
        );
    }

    return (
        <div className="relative w-full h-full group">
            <AnimatePresence mode="sync">
                <motion.img
                    key={current}
                    src={allImages[current]}
                    alt="Cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.85 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </AnimatePresence>

            {isMulti && (
                <>
                    <button
                        onClick={() => setCurrent(p => (p - 1 + allImages.length) % allImages.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    ><ChevronLeft size={16} /></button>
                    <button
                        onClick={() => setCurrent(p => (p + 1) % allImages.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    ><ChevronRight size={16} /></button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {allImages.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`rounded-full transition-all ${i === current ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function BrandPage() {
    const params = useParams();
    const router = useRouter();
    const storename = params.storename;

    const [brand, setBrand] = useState(null);
    const [products, setProducts] = useState([]);
    const [posts, setPosts] = useState([]);
    const [drags, setDrags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('store');
    const [currentUserBrand, setCurrentUserBrand] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [viewerId, setViewerId] = useState('');

    useEffect(() => {
        let vid = localStorage.getItem('viewer_id');
        if (!vid) {
            vid = 'v_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('viewer_id', vid);
        }
        setViewerId(vid);

        const fetchData = async () => {
            try {
                if (!storename) return;
                const brandRes = await api.get(`/api/public/${storename}`);
                const brandData = brandRes.data;
                setBrand(brandData);

                const [productsRes, postsRes, dragsRes] = await Promise.all([
                    api.get(`/api/public/${storename}/products`),
                    api.get(`/api/public/${storename}/posts`),
                    api.get(`/api/public/${storename}/drags`)
                ]);

                setProducts(productsRes.data);
                setPosts(postsRes.data);
                setDrags(dragsRes.data);

                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const meRes = await api.get('/api/auth/me');
                        setCurrentUserBrand(meRes.data.brand);
                        if (brandData.followers && brandData.followers.includes(meRes.data.brand.id)) {
                            setIsFollowing(true);
                        }
                    } catch (e) { }
                }
            } catch (err) {
                console.error("Failed to load brand data", err);
                toast.error("Failed to load brand profile");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [storename]);

    const handleFollow = async () => {
        const token = localStorage.getItem('token');
        if (!token || !currentUserBrand) {
            toast.error("Please login to follow brands");
            router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await api.post(`/api/brands/unfollow/${brand._id}`);
                setIsFollowing(false);
                setBrand(prev => ({ ...prev, followers: prev.followers.filter(id => id !== (currentUserBrand._id || currentUserBrand.id)) }));
                toast.success("Unfollowed successfully");
            } else {
                await api.post(`/api/brands/follow/${brand._id}`);
                setIsFollowing(true);
                setBrand(prev => ({ ...prev, followers: [...(prev.followers || []), (currentUserBrand._id || currentUserBrand.id)] }));
                toast.success("Following!");
                import('canvas-confetti').then((confetti) => confetti.default({ particleCount: 100, spread: 70, origin: { y: 0.6 } }));
            }
        } catch (err) {
            toast.error("Failed to update follow status");
        } finally {
            setFollowLoading(false);
        }
    };

    const handleLike = async (type, id) => {
        try {
            const res = await api.put(`/api/${type}s/${id}/like`, { userId: viewerId });
            if (type === 'post') {
                setPosts(prev => prev.map(p => p._id === id ? { ...p, likes: res.data.likes } : p));
            } else {
                setDrags(prev => prev.map(d => d._id === id ? { ...d, likes: res.data.likes } : d));
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to like");
        }
    };

    const handleCommentSubmit = async (type, id, text) => {
        let guestName = 'Viewer';
        if (!currentUserBrand) {
            const name = prompt("Enter your name to comment (optional):");
            if (name) guestName = name;
        }

        try {
            const res = await api.post(`/api/${type}s/${id}/comment`, { text, guestName });
            if (type === 'post') {
                setPosts(prev => prev.map(p => p._id === id ? { ...p, comments: res.data } : p));
            } else {
                setDrags(prev => prev.map(d => d._id === id ? { ...d, comments: res.data } : d));
            }
            toast.success("Comment added!");
        } catch (e) {
            console.error(e);
            toast.error("Failed to add comment");
        }
    };

    const handleReplySubmit = async (postId, commentId, text) => {
        let guestName = 'Viewer';
        if (!currentUserBrand) {
            const name = prompt("Enter your name to reply (optional):");
            if (name) guestName = name;
        }

        try {
            const res = await api.post(`/api/posts/${postId}/comment/${commentId}/reply`, { text, guestName });
            setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: res.data } : p));
            toast.success("Reply added!");
        } catch (e) {
            console.error(e);
            toast.error("Failed to add reply");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6600]" />
        </div>
    );

    if (!brand) return <div className="min-h-screen flex items-center justify-center text-white bg-black">Brand not found</div>;

    const brandColor = (brand.themeColor && brand.themeColor !== '#000000' && brand.themeColor !== '#ffffff') ? brand.themeColor : '#FF6600';
    const isPremium = brand.tier === 'Premium';
    const hasGem = brand.statusGem && brand.statusGem !== 'None';
    const gemActive = hasGem && (!brand.gemExpiry || new Date(brand.gemExpiry) > new Date());
    const coverImages = isPremium && brand.coverImages?.length > 0 ? brand.coverImages : [];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-[#FF6600] selection:text-white pb-20">
            <Toaster position="top-center" toastOptions={{
                style: { background: '#18181b', color: '#fff', border: `1px solid ${brandColor}4D` },
                success: { iconTheme: { primary: brandColor, secondary: '#fff' } },
            }} />

            {/* Dynamic background accent */}
            <div
                className="fixed top-0 left-0 w-full h-[500px] opacity-20 pointer-events-none blur-[120px]"
                style={{ background: `radial-gradient(circle at 50% 0%, ${brandColor}, transparent 70%)` }}
            />

            {/* Header / Cover */}
            <div className="relative">
                <div className="h-56 md:h-80 bg-zinc-900 relative overflow-hidden">
                    <CoverCarousel images={coverImages} fallback={brand.coverUrl} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>
            </div>

            <div className="container mx-auto px-4 relative z-10 -mt-24">
                <div className="flex flex-col md:flex-row items-end md:items-end gap-6 mb-8">
                    {/* Logo */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-black bg-zinc-900 shadow-2xl overflow-hidden flex-shrink-0"
                    >
                        {brand.logoUrl ? (
                            <img src={brand.logoUrl} alt={brand.brandName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-zinc-700 uppercase">
                                {brand.brandName.charAt(0)}
                            </div>
                        )}
                    </motion.div>

                    {/* Info */}
                    <div className="flex-1 mb-2 min-w-0">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center gap-3 flex-wrap mb-1"
                        >
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight truncate">{brand.brandName}</h1>

                            {/* Verification Badge */}
                            {isPremium && (
                                <span
                                    className="flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full text-xs font-bold"
                                    title="Verified Premium Business"
                                >
                                    <ShieldCheck size={13} /> Verified
                                </span>
                            )}

                            {/* Status Gem Badge */}
                            {gemActive && (
                                <span className="text-2xl drop-shadow-lg" title={`${brand.statusGem} Status Gem`}>
                                    {GEM_ICONS[brand.statusGem]}
                                </span>
                            )}
                        </motion.div>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-zinc-400 text-base md:text-lg mt-1 font-medium max-w-2xl"
                        >
                            {brand.description || "Building the future of commerce."}
                        </motion.p>

                        {/* Metrics */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-6 mt-4 text-sm font-bold text-zinc-500"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-white">{brand.followers?.length || 0}</span> <span className="text-zinc-500 uppercase text-[10px] tracking-wider">Followers</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-white">{brand.views || 0}</span> <span className="text-zinc-500 uppercase text-[10px] tracking-wider">Profile Views</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex gap-3 mb-2 w-full md:w-auto"
                    >
                        <button
                            onClick={handleFollow}
                            disabled={followLoading}
                            className={`flex-1 md:flex-none h-12 px-8 rounded-full font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl ${isFollowing
                                ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                                : 'bg-[#FF6600] text-white hover:bg-[#ff8533] shadow-[#FF6600]/20'
                                }`}
                            style={!isFollowing ? { backgroundColor: brandColor } : {}}
                        >
                            {followLoading ? (
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white" />
                            ) : isFollowing ? (
                                <>Following <Check size={18} /></>
                            ) : (
                                <>Follow <UserPlus size={18} /></>
                            )}
                        </button>
                        <button className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors">
                            <Share2 size={20} />
                        </button>
                    </motion.div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 mb-8 sticky top-0 bg-black/80 backdrop-blur-md z-20 pt-4 overflow-x-auto scrollbar-hide">
                    <TabButton active={activeTab === 'store'} onClick={() => setActiveTab('store')} label={`Store (${products.length})`} color={brandColor} />
                    <TabButton active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} label={`Posts (${posts.length})`} color={brandColor} />
                    <TabButton active={activeTab === 'drags'} onClick={() => setActiveTab('drags')} label={`Drags (${drags.length})`} color={brandColor} />
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'store' && (
                            <motion.div
                                key="store"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
                            >
                                {products.length === 0 ? (
                                    <div className="col-span-full text-center py-24 border border-dashed border-white/10 rounded-3xl bg-zinc-900/20">
                                        <ShoppingBag size={48} className="mx-auto text-zinc-800 mb-4" />
                                        <p className="text-zinc-500 font-medium">This brand hasn't listed any products yet.</p>
                                    </div>
                                ) : products.map((product, i) => (
                                    <ProductCard key={product._id} product={product} brand={brand} index={i} themeColor={brandColor} />
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'posts' && (
                            <motion.div
                                key="posts"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-2xl mx-auto space-y-8"
                            >
                                {posts.length === 0 ? (
                                    <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl bg-zinc-900/20">
                                        <MessageSquare size={48} className="mx-auto text-zinc-800 mb-4" />
                                        <p className="text-zinc-500 font-medium">No posts yet.</p>
                                    </div>
                                ) : posts.map((post, i) => (
                                    <PostCard
                                        key={post._id}
                                        post={post}
                                        brand={brand}
                                        index={i}
                                        viewerId={viewerId}
                                        currentUserBrand={currentUserBrand}
                                        onLike={() => handleLike('post', post._id)}
                                        onComment={(text) => handleCommentSubmit('post', post._id, text)}
                                        onReply={(cid, text) => handleReplySubmit(post._id, cid, text)}
                                        themeColor={brandColor}
                                    />
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'drags' && (
                            <motion.div
                                key="drags"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-2xl mx-auto space-y-6"
                            >
                                {drags.length === 0 ? (
                                    <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl bg-zinc-900/20">
                                        <ShieldCheck size={48} className="mx-auto text-zinc-800 mb-4" />
                                        <p className="text-zinc-500 font-medium">No drags found for this brand.</p>
                                    </div>
                                ) : drags.map((drag, i) => (
                                    <DragCard
                                        key={drag._id}
                                        drag={drag}
                                        index={i}
                                        viewerId={viewerId}
                                        currentUserBrand={currentUserBrand}
                                        onLike={() => handleLike('drag', drag._id)}
                                        onComment={(text) => handleCommentSubmit('drag', drag._id, text)}
                                        themeColor={brandColor}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label, color }) {
    return (
        <button
            onClick={onClick}
            className={`pb-4 px-6 text-sm font-bold transition-colors relative whitespace-nowrap ${active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            {label}
            {active && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: color }}
                />
            )}
        </button>
    );
}

function ProductCard({ product, brand, index, themeColor }) {
    const handleBuy = async () => {
        try {
            await api.post(`/api/analytics/product-click/${product._id}`);
        } catch (e) { }
        const message = `Hi ${brand.brandName}, I'm interested in ${product.name} - ₦${product.price}`;
        window.open(`https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden hover:border-white/20 transition-all group shadow-lg"
        >
            <div className="aspect-square bg-zinc-800 relative overflow-hidden">
                {(product.images?.[0] || product.imageUrl) ? (
                    <img src={product.images?.[0] || product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 font-medium">No Image</div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                        onClick={handleBuy}
                        className="bg-white text-black px-8 py-3 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
                    >
                        Buy on WhatsApp
                    </button>
                </div>
            </div>
            <div className="p-5">
                <h3 className="font-bold text-white truncate text-base mb-1">{product.name}</h3>
                <p className="font-black text-lg" style={{ color: themeColor }}>₦{product.price.toLocaleString()}</p>
            </div>
        </motion.div>
    );
}

function PostCard({ post, brand, index, onLike, onComment, onReply, viewerId, currentUserBrand, themeColor }) {
    const isLiked = post.likes && post.likes.includes(viewerId);
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        onComment(commentText);
        setCommentText('');
    };

    const handleReplySubmit = (cid, e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        onReply(cid, replyText);
        setReplyText('');
        setReplyingTo(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden p-6 shadow-2xl backdrop-blur-md"
        >
            <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden border border-white/10 shadow-lg">
                    {brand.logoUrl && <img src={brand.logoUrl} alt="" className="w-full h-full object-cover" />}
                </div>
                <div>
                    <h4 className="font-bold text-white text-lg leading-tight flex items-center gap-2">
                        {brand.brandName}
                        {brand.tier === 'Premium' && <ShieldCheck size={16} className="text-blue-400" />}
                    </h4>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                </div>
            </div>
            <p className="text-zinc-200 leading-relaxed mb-5 text-[17px] whitespace-pre-wrap font-medium">{post.content}</p>
            {post.imageUrl && (
                <div className="rounded-2xl overflow-hidden mb-6 border border-white/10 shadow-inner bg-black/20">
                    <img src={post.imageUrl} alt="Post content" className="w-full max-h-[600px] object-contain" />
                </div>
            )}

            <div className="flex items-center gap-8 pt-4 border-t border-white/5 text-zinc-400">
                <button
                    onClick={onLike}
                    className={`flex items-center gap-2.5 transition-all active:scale-90 ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                >
                    <Heart size={22} fill={isLiked ? "currentColor" : "none"} strokeWidth={2.5} />
                    <span className="font-bold text-sm tracking-wider">{post.likes?.length || 0}</span>
                </button>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-2.5 transition-all hover:text-blue-400 ${showComments ? 'text-blue-400' : ''}`}
                >
                    <MessageSquare size={22} strokeWidth={2.5} />
                    <span className="font-bold text-sm tracking-wider">{post.comments?.length || 0}</span>
                </button>
                <button className="flex items-center gap-2.5 hover:text-green-400 transition-all ml-auto">
                    <Share2 size={22} strokeWidth={2.5} />
                </button>
            </div>

            {/* Inline Comment Input */}
            <div className="mt-6 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-bold overflow-hidden shadow-md">
                    {currentUserBrand?.logoUrl ? <img src={currentUserBrand.logoUrl} className="w-full h-full object-cover" /> : 'YOU'}
                </div>
                <form onSubmit={handleCommentSubmit} className="flex-1 relative group">
                    <input
                        type="text"
                        placeholder="Write a comment..."
                        className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-2 text-sm focus:outline-none focus:border-white/30 transition-all pr-10 text-white placeholder:text-zinc-600"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button type="submit" disabled={!commentText.trim()} className="absolute right-2 top-1.5 p-1 text-white/40 hover:text-white transition-colors disabled:opacity-0 group-focus-within:opacity-100">
                        <Send size={18} />
                    </button>
                </form>
            </div>

            {/* Comments List */}
            <AnimatePresence>
                {showComments && post.comments && post.comments.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-6 pt-6 border-t border-white/5 space-y-5 overflow-hidden"
                    >
                        {post.comments.map((comment, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex gap-3 items-start group">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-500 uppercase">
                                        {comment.guestName?.[0] || 'A'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-white/5 rounded-2xl p-3 border border-white/5 shadow-sm">
                                            <p className="font-black text-xs text-zinc-400 mb-1 leading-none">{comment.guestName}</p>
                                            <p className="text-sm text-zinc-200 leading-normal">{comment.text}</p>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1.5 ml-1">
                                            <button
                                                onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                                className="text-[10px] font-black uppercase tracking-tighter text-zinc-500 hover:text-white transition-colors"
                                            >
                                                Reply
                                            </button>
                                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Reply Input */}
                                {replyingTo === comment._id && (
                                    <div className="pl-11 pr-2">
                                        <form onSubmit={(e) => handleReplySubmit(comment._id, e)} className="relative">
                                            <input
                                                type="text"
                                                autoFocus
                                                placeholder={`Replying to ${comment.guestName}...`}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-white/30 text-white"
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                            />
                                            <button type="submit" className="absolute right-2 top-1.5 p-1 text-white/50"><Send size={14} /></button>
                                        </form>
                                    </div>
                                )}

                                {/* Replies */}
                                {comment.replies?.map((reply, j) => (
                                    <div key={j} className="pl-11 flex gap-2.5 items-start">
                                        <div className="text-zinc-800 pt-1"><CornerDownRight size={14} /></div>
                                        <div className="bg-white/5 px-3 py-2 rounded-xl border border-white/5 flex-1">
                                            <span className="text-[11px] font-black text-zinc-400 mr-2 uppercase">{reply.guestName}:</span>
                                            <span className="text-xs text-zinc-300">{reply.text}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function DragCard({ drag, index, onLike, onComment, viewerId, currentUserBrand, themeColor }) {
    const isLiked = drag.likes && drag.likes.includes(viewerId);
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        onComment(commentText);
        setCommentText('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-zinc-900/60 border border-white/5 p-6 rounded-3xl shadow-xl backdrop-blur-md"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                    {drag.author?.logoUrl && <img src={drag.author.logoUrl} className="w-full h-full object-cover" alt="" />}
                </div>
                <div>
                    <h4 className="font-bold text-white text-sm">{drag.author?.brandName || 'Anonymous'}</h4>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">@{drag.author?.username}</p>
                </div>
            </div>
            <p className="text-zinc-200 text-base mb-4 leading-relaxed font-medium">{drag.content}</p>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#FF6000] bg-[#FF6000]/10 border border-[#FF6000]/20 px-4 py-1.5 rounded-full inline-block mb-6 shadow-sm">
                Tag: {drag.targetBrand?.brandName || 'Unknown'}
            </div>

            <div className="flex items-center gap-8 pt-4 border-t border-white/5 text-zinc-400">
                <button
                    onClick={onLike}
                    className={`flex items-center gap-2 transition-all active:scale-90 ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                >
                    <Heart size={20} fill={isLiked ? "currentColor" : "none"} strokeWidth={2.5} />
                    <span className="font-bold text-xs">{drag.likes?.length || 0}</span>
                </button>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-2 transition-all hover:text-blue-400 ${showComments ? 'text-blue-400' : ''}`}
                >
                    <MessageSquare size={20} strokeWidth={2.5} />
                    <span className="font-bold text-xs">{drag.comments?.length || 0}</span>
                </button>
            </div>

            {/* Inline Comment Input */}
            <div className="mt-5 flex gap-3">
                <form onSubmit={handleCommentSubmit} className="flex-1 relative group">
                    <input
                        type="text"
                        placeholder="Write a comment..."
                        className="w-full bg-black/30 border border-white/10 rounded-full px-5 py-2 text-xs focus:outline-none focus:border-white/30 transition-all pr-10 text-white"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button type="submit" className="absolute right-2 top-1.5 p-1 text-white/30 hover:text-white transition-colors"><Send size={16} /></button>
                </form>
            </div>

            {/* Comments List */}
            {showComments && drag.comments && drag.comments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                    {drag.comments.map((comment, i) => (
                        <div key={i} className="text-xs bg-white/5 p-3 rounded-2xl border border-white/5">
                            <span className="font-black text-white mr-2 uppercase text-[10px] tracking-tighter">{comment.guestName}:</span>
                            <span className="text-zinc-400">{comment.text}</span>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
