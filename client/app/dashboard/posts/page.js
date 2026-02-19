'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { MessageSquare, Heart, Share2, MoreHorizontal, Send, Image, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PostsPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [brand, setBrand] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null); // Comment ID
    const [replyText, setReplyText] = useState('');

    const [editingPostId, setEditingPostId] = useState(null);

    useEffect(() => {
        fetchBrand();
    }, []);

    useEffect(() => {
        if (brand) {
            fetchPosts();
        }
    }, [brand]);

    // ... fetchBrand and fetchPosts ...

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleEditClick = (post) => {
        setNewPostContent(post.content);
        setImagePreview(post.imageUrl);
        setEditingPostId(post._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setNewPostContent('');
        setImageFile(null);
        setImagePreview(null);
        setEditingPostId(null);
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('content', newPostContent);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            if (editingPostId) {
                await api.put(`/api/posts/${editingPostId}`, formData);
                setEditingPostId(null);
            } else {
                await api.post('/api/posts', formData);
            }

            setNewPostContent('');
            setImageFile(null);
            setImagePreview(null);
            fetchPosts(); // Refresh list
            // Add confetti or toast here
        } catch (err) {
            console.error("Failed to save post", err);
            alert('Failed to save post');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        const token = localStorage.getItem('token');
        try {
            await api.delete(`/api/posts/${postId}`);
            setPosts(posts.filter(p => p._id !== postId));
            // toast.success("Post deleted");
        } catch (err) {
            console.error("Failed to delete post", err);
            alert("Failed to delete post");
        }
    };

    const handleReply = async (postId, commentId) => {
        if (!replyText.trim()) return;

        const token = localStorage.getItem('token');
        try {
            const res = await api.post(`/api/posts/${postId}/comment/${commentId}/reply`, {
                text: replyText
            });

            // Update posts state with new comments (res.data returns updated comments array)
            setPosts(posts.map(p => p._id === postId ? { ...p, comments: res.data } : p));
            setReplyingTo(null);
            setReplyText('');
            // toast.success("Reply added");
        } catch (err) {
            console.error("Failed to reply", err);
            alert("Failed to reply");
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-zinc-900">Your Posts</h1>
                <div className="text-sm text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">{posts.length} Total Posts</div>
            </div>

            {/* Create Post Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
                <div className="flex gap-4">
                    <div className="h-12 w-12 bg-zinc-100 rounded-full flex-shrink-0 overflow-hidden border border-zinc-200">
                        {brand?.logoUrl && <img src={brand.logoUrl} alt="Brand" className="h-full w-full object-cover" />}
                    </div>
                    <form onSubmit={handleCreatePost} className="flex-1 space-y-4">
                        <textarea
                            placeholder="What's new with your brand?"
                            className="w-full p-4 bg-zinc-50 border-none rounded-xl focus:ring-2 focus:ring-[#FF6600] text-zinc-900 placeholder-zinc-400 resize-none h-24 text-base"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                        />

                        {imagePreview && (
                            <div className="relative rounded-xl overflow-hidden mb-4 border border-zinc-200">
                                <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover" />
                                <button
                                    type="button"
                                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                            <label className="cursor-pointer text-[#FF6600] hover:bg-orange-50 p-2 rounded-full transition-colors">
                                <Image size={20} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>

                            <div className="flex gap-2">
                                {editingPostId && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-full font-bold text-sm hover:bg-zinc-200"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={!newPostContent && !imageFile}
                                    className="px-6 py-2 bg-black text-white rounded-full font-bold text-sm hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                                >
                                    {editingPostId ? 'Update Post' : 'Post Update'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6600]"></div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-zinc-500">No posts yet. Start engaging your audience!</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {posts.map((post, index) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                brand={brand}
                                index={index}
                                onDelete={() => handleDeletePost(post._id)}
                                onEdit={() => handleEditClick(post)}
                                replyingTo={replyingTo}
                                setReplyingTo={setReplyingTo}
                                replyText={replyText}
                                setReplyText={setReplyText}
                                onReply={handleReply}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}

function PostCard({ post, brand, index, onDelete, onEdit, replyingTo, setReplyingTo, replyText, setReplyText, onReply }) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden hover:shadow-md transition-shadow relative"
        >
            <div className="p-4 flex gap-3 items-start">
                <div className="h-10 w-10 bg-zinc-100 rounded-full flex-shrink-0 overflow-hidden">
                    {brand?.logoUrl && <img src={brand.logoUrl} alt="Brand" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-zinc-900">{brand?.brandName}</p>
                            <p className="text-xs text-zinc-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="relative">
                            <button onClick={() => setShowMenu(!showMenu)} className="text-zinc-400 hover:text-black p-1 rounded-full hover:bg-zinc-100 transition-colors">
                                <MoreHorizontal size={18} />
                            </button>
                            {showMenu && (
                                <div className="absolute right-0 top-8 bg-white border border-zinc-200 shadow-xl rounded-xl py-2 w-36 z-10 flex flex-col">
                                    <button
                                        onClick={() => { onEdit(); setShowMenu(false); }}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 flex items-center gap-2 font-medium text-zinc-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => { onDelete(); setShowMenu(false); }}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="mt-3 text-zinc-800 whitespace-pre-wrap">{post.content}</p>
                </div>
            </div>

            {post.imageUrl && (
                <div className="w-full h-64 md:h-80 bg-zinc-100 overflow-hidden">
                    <img src={post.imageUrl} alt="Post Content" className="w-full h-full object-cover" />
                </div>
            )}

            <div className="p-4 border-t border-zinc-50 flex items-center gap-6 text-zinc-500 text-sm font-medium">
                <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                    <Heart size={18} />
                    {post.likes?.length || 0}
                </button>
                <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                    <MessageSquare size={18} />
                    {post.comments?.length || 0}
                </button>
                <button className="flex items-center gap-2 hover:text-green-500 transition-colors ml-auto">
                    <Share2 size={18} />
                </button>
            </div>

            {/* Comments Section */}
            {post.comments?.length > 0 && (
                <div className="bg-zinc-50 p-4 border-t border-zinc-100 space-y-4">
                    {post.comments.slice(0, 3).map((comment, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex gap-2 text-sm">
                                <span className="font-bold text-zinc-900">{comment.guestName || 'Anonymous'}:</span>
                                <span className="text-zinc-700">{comment.text}</span>
                            </div>

                            <div className="flex items-center gap-4 pl-2">
                                <button
                                    onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                    className="text-xs text-zinc-500 hover:text-blue-500 font-medium"
                                >
                                    Reply
                                </button>
                                {comment.replies?.length > 0 && <span className="text-xs text-zinc-400">{comment.replies.length} replies</span>}
                            </div>

                            {replyingTo === comment._id && (
                                <div className="pl-4 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Write a reply..."
                                        className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-zinc-400"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && onReply(post._id, comment._id)}
                                    />
                                    <button
                                        onClick={() => onReply(post._id, comment._id)}
                                        className="text-[#FF6600]"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            )}

                            {comment.replies?.map((reply, j) => (
                                <div key={j} className="pl-4 text-xs text-zinc-600 flex gap-1 border-l-2 border-zinc-200 ml-2">
                                    <span className="font-bold">{reply.guestName}:</span> {reply.text}
                                </div>
                            ))}
                        </div>
                    ))}
                    {post.comments.length > 3 && (
                        <button className="text-xs text-zinc-500 hover:text-[#FF6600] font-medium">
                            View all {post.comments.length} comments
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
}
