'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { ShoppingBag, MessageSquare, Heart, Share2, Phone } from 'lucide-react';

export default function BrandPage() {
    const params = useParams();
    const subdomain = params.subdomain;

    const [brand, setBrand] = useState(null);
    const [products, setProducts] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('store'); // 'store' or 'posts'

    useEffect(() => {
        const fetchData = async () => {
            try {
                // In a real app, we might use a custom domain mapping or middleware
                // Here we assume the route captured the subdomain param
                if (!subdomain) return;

                const brandRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/public/${subdomain}`);
                setBrand(brandRes.data);

                const productsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/public/${subdomain}/products`);
                setProducts(productsRes.data);

                const postsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/public/${subdomain}/posts`);
                setPosts(postsRes.data);
            } catch (err) {
                console.error("Failed to load brand data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subdomain]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!brand) return <div className="min-h-screen flex items-center justify-center">Brand not found</div>;

    // Dynamic Styles based on brand theme
    const themeStyle = {
        '--brand-color': brand.themeColor || '#000000',
    };

    return (
        <div className="min-h-screen bg-gray-50" style={themeStyle}>
            {/* Brand Header / Hero */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="h-32 md:h-48 bg-[var(--brand-color)] relative">
                    {brand.coverUrl && (
                        <img src={brand.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    )}
                </div>
                <div className="container mx-auto px-4 pb-4">
                    <div className="relative -mt-12 mb-4 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden mb-3">
                            {brand.logoUrl ? (
                                <img src={brand.logoUrl} alt={brand.brandName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400">
                                    {brand.brandName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold">{brand.brandName}</h1>
                        <p className="text-gray-600 max-w-lg mt-1">{brand.description}</p>

                        {brand.cacDetails?.registered && (
                            <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Verified Business
                            </span>
                        )}
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex justify-center space-x-8 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('store')}
                            className={`pb-3 px-4 text-sm font-medium transition-colors ${activeTab === 'store'
                                ? 'border-b-2 border-[var(--brand-color)] text-[var(--brand-color)]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Store ({products.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`pb-3 px-4 text-sm font-medium transition-colors ${activeTab === 'posts'
                                ? 'border-b-2 border-[var(--brand-color)] text-[var(--brand-color)]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Posts ({posts.length})
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {activeTab === 'store' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} brand={brand} />
                        ))}
                    </div>
                ) : (
                    <div className="max-w-xl mx-auto space-y-6">
                        {posts.map((post) => (
                            <PostCard key={post._id} post={post} brand={brand} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

function ProductCard({ product, brand }) {
    const handleBuy = () => {
        const message = `Hi ${brand.brandName}, I'm interested in ${product.name} - ${product.price}`;
        const url = `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-square bg-gray-100 relative">
                {product.imageUrl && (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                )}
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                <p className="text-[var(--brand-color)] font-bold mt-1">₦{product.price.toLocaleString()}</p>
                <button
                    onClick={handleBuy}
                    className="mt-3 w-full bg-zinc-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                >
                    <ShoppingBag size={16} />
                    Buy Now
                </button>
            </div>
        </div>
    );
}

function PostCard({ post: initialPost, brand }) {
    const [post, setPost] = useState(initialPost);
    const [commentText, setCommentText] = useState('');
    const [commenting, setCommenting] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const handleLike = async () => {
        try {
            // Simple like implementation - just using a dummy user ID or IP would be better but for now let's just hit the endpoint
            // The backend implementation expects userId in body. We can generate a random one or use localstorage ID.
            let userId = localStorage.getItem('guest_id');
            if (!userId) {
                userId = Math.random().toString(36).substring(7);
                localStorage.setItem('guest_id', userId);
            }

            const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post._id}/like`, { userId });
            setPost(prev => ({ ...prev, likes: res.data.likes ? res.data.likes : prev.likes })); // Adjust based on actual API return
            // Assuming API returns the updated post or we manually update local state
            // Actually backend returns the post.
            setPost(res.data);
        } catch (err) {
            console.error('Like failed', err);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setCommenting(true);

        try {
            const token = localStorage.getItem('token');
            const payload = {
                text: commentText,
                guestName: 'Guest' // Could add an input for name
            };

            // If we have a token, we might be a brand.
            // But we need to verify the token first or just send it?
            // The backend endpoint checks body.authorBrandId.
            // If we want to support "Logged in as Brand", we need to decode token or fetch 'me'.
            // For simplicity, let's just check if token exists and assume valid.
            // Ideally we'd decode to get ID. Or strict backend check.

            // Let's decode or fetch 'me' if token exists? Too slow for just typing.
            // We can optimistic UI update.
            // Or just send the request.

            let config = {};
            if (token) {
                // If the user IS logged in, we want to attribute the comment to them.
                // The backend implementation `router.post('/:id/comment', ...)`
                // expects `authorBrandId` in body.
                // We need the ID.
                // We can't easily get it here without context.
                // Let's rely on the user manually entering it? No.
                // We should probably rely on a context or fetch it once.

                // Workaround: We will just post as anonymous for now unless we are in the dashboard context.
                // But this is the public page. A brand MIGHT be browsing another brand.

                // Let's try to get the profile from an endpoint if token exists.
                try {
                    const meRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                        headers: { 'x-auth-token': token }
                    });
                    payload.authorBrandId = meRes.data.brand.id;
                } catch (e) {
                    // Token invalid or expired
                }
            }

            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post._id}/comment`, payload);
            // res.data is the updated comments array
            setPost(prev => ({ ...prev, comments: res.data }));
            setCommentText('');
        } catch (err) {
            console.error('Comment failed', err);
        } finally {
            setCommenting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    {brand.logoUrl && <img src={brand.logoUrl} alt="" className="w-full h-full object-cover" />}
                </div>
                <div>
                    <h4 className="font-semibold text-sm">{brand.brandName}</h4>
                    <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
            {post.imageUrl && (
                <div className="aspect-video bg-gray-100">
                    <img src={post.imageUrl} alt="" className="w-full h-full object-contain bg-black" />
                </div>
            )}
            <div className="p-4">
                <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>

                <div className="mt-4 flex items-center gap-4 border-t pt-3">
                    <button onClick={handleLike} className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                        <Heart size={20} className={post.likes?.includes(localStorage.getItem('guest_id')) ? 'fill-red-500 text-red-500' : ''} />
                        <span className="text-sm">{post.likes?.length || 0}</span>
                    </button>
                    <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors">
                        <MessageSquare size={20} />
                        <span className="text-sm">{post.comments?.length || 0}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-500 hover:text-green-500 transition-colors ml-auto">
                        <Share2 size={20} />
                    </button>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-4 bg-gray-50 p-3 rounded-lg space-y-3">
                        <form onSubmit={handleComment} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Write a comment..."
                                className="flex-1 text-sm border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-black"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={commenting || !commentText.trim()}
                                className="text-sm font-semibold text-black disabled:opacity-50"
                            >
                                Post
                            </button>
                        </form>

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {post.comments && post.comments.map((comment, idx) => (
                                <div key={idx} className="text-sm bg-white p-2 rounded shadow-sm">
                                    <span className="font-semibold text-gray-900">{comment.isAnonymous ? (comment.guestName || 'Anonymous') : (comment.authorBrand?.brandName || 'Brand')}: </span>
                                    <span className="text-gray-600">{comment.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
