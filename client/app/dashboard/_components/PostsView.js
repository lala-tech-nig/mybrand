'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { MessageSquare, Heart, Share2, MoreHorizontal, Send, Image, Trash2, CornerDownRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function PostsView({ brand }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [commentingTo, setCommentingTo] = useState(null);
    const [newCommentText, setNewCommentText] = useState('');
    const [replyText, setReplyText] = useState('');
    const [editingPostId, setEditingPostId] = useState(null);

    useEffect(() => {
        if (brand) fetchPosts();
    }, [brand]);

    const fetchPosts = async () => {
        try {
            const brandId = brand._id || brand.id;
            const res = await api.get(`/api/posts/brand/${brandId}`);
            setPosts(res.data);
        } catch (err) {
            console.error("Failed to load posts", err);
        } finally {
            setLoading(false);
        }
    };

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
        const formData = new FormData();
        formData.append('content', newPostContent);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            if (editingPostId) {
                await api.put(`/api/posts/${editingPostId}`, formData);
                setEditingPostId(null);
                toast.success("Post updated!");
            } else {
                await api.post('/api/posts', formData);
                toast.success("Post created!");
            }

            setNewPostContent('');
            setImageFile(null);
            setImagePreview(null);
            fetchPosts();
        } catch (err) {
            console.error("Failed to save post", err);
            toast.error('Failed to save post');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            await api.delete(`/api/posts/${postId}`);
            setPosts(posts.filter(p => p._id !== postId));
            toast.success("Post deleted");
        } catch (err) {
            toast.error("Failed to delete post");
        }
    };

    const handleToggleVisibility = async (postId) => {
        try {
            const res = await api.put(`/api/posts/${postId}/visibility`);
            setPosts(posts.map(p => p._id === postId ? { ...p, isHidden: res.data.isHidden } : p));
            toast.success(res.data.isHidden ? "Post hidden from public" : "Post is now public");
        } catch (err) {
            toast.error("Failed to update visibility");
        }
    };

    const handleComment = async (postId) => {
        if (!newCommentText.trim()) return;

        try {
            const res = await api.post(`/api/posts/${postId}/comment`, {
                text: newCommentText
            });
            setPosts(posts.map(p => p._id === postId ? { ...p, comments: res.data } : p));
            setNewCommentText('');
            setCommentingTo(null);
            toast.success("Comment added!");
        } catch (err) {
            console.error("Failed to add comment:", err);
            const msg = err.response?.data?.message || err.message || "Failed to add comment";
            toast.error(msg);
        }
    };

    const handleReply = async (postId, commentId) => {
        if (!replyText.trim()) return;

        try {
            const res = await api.post(`/api/posts/${postId}/comment/${commentId}/reply`, {
                text: replyText
            });

            setPosts(posts.map(p => p._id === postId ? { ...p, comments: res.data } : p));
            setReplyingTo(null);
            setReplyText('');
            toast.success("Reply added");
        } catch (err) {
            console.error("Failed to reply:", err);
            const msg = err.response?.data?.message || err.message || "Failed to reply";
            toast.error(msg);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-zinc-900">Your Posts ({posts.length})</h3>
            </div>

            {/* Create Post Card */}
            <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-zinc-100">
                <div className="flex gap-3 md:gap-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 bg-zinc-100 rounded-full flex-shrink-0 overflow-hidden border border-zinc-200">
                        {brand?.logoUrl && <img src={brand.logoUrl} alt="Brand" className="h-full w-full object-cover" />}
                    </div>
                    <form onSubmit={handleCreatePost} className="flex-1 space-y-4">
                        <textarea
                            placeholder="What's new with your brand?"
                            className="w-full p-4 bg-zinc-50 border-none rounded-2xl focus:ring-2 focus:ring-[#FF6600] text-zinc-900 placeholder-zinc-400 resize-none h-24 text-[15px] md:text-base"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                        />

                        {imagePreview && (
                            <div className="relative rounded-2xl overflow-hidden mb-4 border border-zinc-200 shadow-sm">
                                <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover" />
                                <button
                                    type="button"
                                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                                    className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                            <label className="cursor-pointer text-[#FF6600] hover:bg-orange-50 p-2 md:px-4 md:py-2 rounded-full transition-colors flex items-center gap-2 font-bold text-xs md:text-sm">
                                <Image size={20} />
                                <span className="hidden sm:inline">Add Image</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>

                            <div className="flex gap-2">
                                {editingPostId && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-full font-bold text-xs md:text-sm hover:bg-zinc-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={!newPostContent && !imageFile}
                                    className="px-6 py-2 bg-black text-white rounded-full font-bold text-xs md:text-sm hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-black/10"
                                >
                                    {editingPostId ? 'Update Post' : 'Post Update'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6 pb-12">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6600]"></div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                        <MessageSquare className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                        <p className="text-zinc-500 font-bold px-4">No updates posted yet. Start engaging your brand audience!</p>
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
                                commentingTo={commentingTo}
                                setCommentingTo={setCommentingTo}
                                commentText={newCommentText}
                                setCommentText={setNewCommentText}
                                onComment={handleComment}
                                onToggleVisibility={() => handleToggleVisibility(post._id)}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}

function PostCard({ post, brand, index, onDelete, onEdit, replyingTo, setReplyingTo, replyText, setReplyText, onReply, commentingTo, setCommentingTo, commentText, setCommentText, onComment, onToggleVisibility }) {
    const [showMenu, setShowMenu] = useState(false);
    const [showComments, setShowComments] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-[2rem] shadow-sm border border-zinc-100 overflow-hidden hover:shadow-md transition-shadow relative"
        >
            <div className="p-4 md:p-6 flex gap-3 md:gap-4 items-start">
                <div className="h-10 w-10 md:h-12 md:w-12 bg-zinc-100 rounded-full flex-shrink-0 overflow-hidden border border-zinc-100 shadow-sm">
                    {brand?.logoUrl && <img src={brand.logoUrl} alt="Brand" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-black text-zinc-900 flex items-center gap-1.5 text-sm md:text-base">
                                {brand?.brandName}
                                {brand?.tier === 'Premium' && (
                                    <span className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white ring-2 ring-blue-100">✓</span>
                                )}
                            </p>
                            <p className="text-[10px] md:text-xs text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                {post.isHidden && (
                                    <span className="flex items-center gap-1 text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md lowercase tracking-normal">
                                        <EyeOff size={10} /> hidden
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="relative">
                            <button onClick={() => setShowMenu(!showMenu)} className="text-zinc-400 hover:text-black p-2 rounded-xl hover:bg-zinc-50 transition-colors">
                                <MoreHorizontal size={20} />
                            </button>
                            {showMenu && (
                                <div className="absolute right-0 top-12 bg-white border border-zinc-100 shadow-2xl rounded-2xl py-2 w-48 z-20 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                    <button
                                        onClick={() => { onEdit(); setShowMenu(false); }}
                                        className="w-full text-left px-5 py-3 text-sm hover:bg-zinc-50 flex items-center gap-3 font-bold text-zinc-700 transition-colors"
                                    >
                                        <MoreHorizontal size={16} /> Edit Post
                                    </button>
                                    <button
                                        onClick={() => { onToggleVisibility(); setShowMenu(false); }}
                                        className="w-full text-left px-5 py-3 text-sm hover:bg-zinc-50 flex items-center gap-3 font-bold text-zinc-700 transition-colors"
                                    >
                                        {post.isHidden ? <><Eye size={16} /> Show Post</> : <><EyeOff size={16} /> Hide Post</>}
                                    </button>
                                    <button
                                        onClick={() => { onDelete(); setShowMenu(false); }}
                                        className="w-full text-left px-5 py-3 text-sm hover:bg-red-50 text-red-600 flex items-center gap-3 font-bold transition-colors"
                                    >
                                        Delete Post
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="mt-4 text-zinc-800 text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{post.content}</p>
                </div>
            </div>

            {post.imageUrl && (
                <div className="w-full max-h-[600px] bg-zinc-50 overflow-hidden border-y border-zinc-50 mt-1">
                    <img src={post.imageUrl} alt="Post Content" className="w-full h-full object-contain mx-auto" />
                </div>
            )}

            <div className="px-5 py-4 border-t border-zinc-50 flex items-center gap-6 text-zinc-500 text-xs md:text-sm font-black">
                <button className="flex items-center gap-2 hover:text-red-500 transition-colors group">
                    <div className="p-2 rounded-full group-hover:bg-red-50 transition-colors">
                        <Heart size={20} />
                    </div>
                    {post.likes?.length || 0}
                </button>
                <button
                    onClick={() => {
                        setShowComments(!showComments);
                        if (!showComments) setCommentingTo(post._id);
                    }}
                    className={`flex items-center gap-2 transition-colors group ${showComments ? 'text-[#FF6600]' : 'hover:text-[#FF6600]'}`}
                >
                    <div className={`p-2 rounded-full transition-colors ${showComments ? 'bg-orange-50' : 'group-hover:bg-orange-50'}`}>
                        <MessageSquare size={20} />
                    </div>
                    {post.comments?.length || 0}
                </button>
                <button className="flex items-center gap-2 hover:text-[#FF6600] transition-colors ml-auto group">
                    <div className="p-2 rounded-full group-hover:bg-orange-50 transition-colors">
                        <Share2 size={20} />
                    </div>
                </button>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-zinc-50 border-t border-zinc-100 overflow-hidden"
                    >
                        <div className="p-4 md:p-6 space-y-6">
                            {/* New Comment Input */}
                            <div className="flex gap-3">
                                <div className="h-8 w-8 bg-white rounded-full flex-shrink-0 overflow-hidden border border-zinc-200 shadow-sm">
                                    {brand?.logoUrl && <img src={brand.logoUrl} alt="" className="h-full w-full object-cover" />}
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        className="w-full bg-white border border-zinc-200 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-orange-50 pr-10 shadow-sm transition-all"
                                        value={commentingTo === post._id ? commentText : ''}
                                        onChange={(e) => {
                                            setCommentingTo(post._id);
                                            setCommentText(e.target.value);
                                        }}
                                        onKeyPress={(e) => e.key === 'Enter' && onComment(post._id)}
                                    />
                                    <button
                                        onClick={() => onComment(post._id)}
                                        disabled={!commentText.trim()}
                                        className="absolute right-2 top-2 text-[#FF6600] disabled:opacity-30 p-1 hover:bg-orange-50 rounded-full transition-colors"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Comments List */}
                            <div className="space-y-5">
                                {post.comments?.length === 0 ? (
                                    <p className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 py-4">Be the first to comment</p>
                                ) : (
                                    post.comments.map((comment, i) => (
                                        <div key={i} className="space-y-4">
                                            <div className="flex gap-3 items-start">
                                                <div className="h-8 w-8 bg-zinc-200 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black text-zinc-500 border border-zinc-200 uppercase shadow-sm">
                                                    {comment.guestName?.[0] || 'A'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-zinc-100 shadow-sm">
                                                        <p className="text-[11px] font-black text-zinc-900 mb-1 leading-none uppercase tracking-tighter">{comment.guestName}</p>
                                                        <p className="text-sm text-zinc-600 leading-relaxed font-medium">{comment.text}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-2 ml-1">
                                                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                        <button
                                                            onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                                            className="text-[11px] text-zinc-500 hover:text-[#FF6600] font-black uppercase tracking-tighter transition-colors"
                                                        >
                                                            Reply
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Reply Input */}
                                            <AnimatePresence>
                                                {replyingTo === comment._id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: 10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 10 }}
                                                        className="pl-11 flex gap-2"
                                                    >
                                                        <div className="flex-1 relative">
                                                            <input
                                                                type="text"
                                                                autoFocus
                                                                placeholder={`Replying to ${comment.guestName}...`}
                                                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#FF6600] shadow-sm pr-10"
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                onKeyPress={(e) => e.key === 'Enter' && onReply(post._id, comment._id)}
                                                            />
                                                            <button
                                                                onClick={() => onReply(post._id, comment._id)}
                                                                className="absolute right-2 top-1.5 text-[#FF6600] p-1"
                                                            >
                                                                <Send size={14} />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Replies List */}
                                            {comment.replies?.map((reply, j) => (
                                                <div key={j} className="pl-11 flex gap-3 items-start">
                                                    <div className="text-zinc-300 mt-1">
                                                        <CornerDownRight size={16} />
                                                    </div>
                                                    <div className="bg-zinc-100/50 px-4 py-2.5 rounded-2xl border border-zinc-200/50 flex-1 shadow-sm">
                                                        <p className="text-[11px] font-black text-zinc-900 mb-0.5 uppercase tracking-tighter">{reply.guestName}:</p>
                                                        <p className="text-xs text-zinc-600 font-medium leading-relaxed">{reply.text}</p>
                                                        <div className="text-[9px] text-zinc-400 font-bold mt-1 uppercase tracking-widest">{new Date(reply.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
