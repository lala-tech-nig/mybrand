'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, MessageSquare, ThumbsUp } from 'lucide-react';

export default function PostsPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState({ content: '', imageUrl: '' });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            // First get brand ID
            const authRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                headers: { 'x-auth-token': token }
            });
            const brandId = authRes.data.brand.id;

            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/brand/${brandId}`);
            setPosts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, newPost, {
                headers: { 'x-auth-token': token }
            });
            setPosts([res.data, ...posts]);
            setNewPost({ content: '', imageUrl: '' });
        } catch (err) {
            alert('Failed to create post');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this post?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setPosts(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            alert('Failed to delete post');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Post Column */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                    <h2 className="text-lg font-bold mb-4">Create New Post</h2>
                    <form onSubmit={handleCreate}>
                        <div className="mb-4">
                            <textarea
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-black focus:border-black"
                                rows="4"
                                placeholder="What's new with your brand?"
                                value={newPost.content}
                                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                required
                            ></textarea>
                        </div>
                        <div className="mb-4">
                            <input
                                type="url"
                                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                placeholder="Image URL (optional)"
                                value={newPost.imageUrl}
                                onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={creating}
                            className="w-full bg-black text-white py-2 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50"
                        >
                            {creating ? 'Posting...' : 'Post Update'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Posts Feed Column */}
            <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-bold">Your Posts</h2>
                {loading ? (
                    <div>Loading...</div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                        <p className="text-gray-500">No posts yet. Share your first update!</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <div key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {post.imageUrl && (
                                <div className="h-64 bg-gray-100 relative">
                                    <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="p-6">
                                <p className="text-gray-800 whitespace-pre-wrap mb-4">{post.content}</p>
                                <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                                    <div className="flex gap-4">
                                        <span className="flex items-center gap-1"><ThumbsUp size={16} /> {post.likes?.length || 0}</span>
                                        <span className="flex items-center gap-1"><MessageSquare size={16} /> {post.comments?.length || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            className="text-red-500 hover:text-red-700 flex items-center gap-1"
                                        >
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Comments Preview */}
                                {post.comments && post.comments.length > 0 && (
                                    <div className="mt-4 bg-gray-50 p-3 rounded-lg space-y-2">
                                        {post.comments.slice(0, 3).map((comment, idx) => (
                                            <div key={idx} className="text-sm">
                                                <span className="font-semibold text-gray-900">{comment.isAnonymous ? (comment.guestName || 'Anonymous') : (comment.authorBrand?.brandName || 'Brand')}: </span>
                                                <span className="text-gray-600">{comment.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
