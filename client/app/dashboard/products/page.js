'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            // Assuming we have an endpoint to get "my" products or we use the public one if auth is tricky
            // Better to have a protected route like /api/products/me or use the public one with brand ID if we store it.
            // Let's check routes/products.js first.
            // If no specific "me" route, we can get brand ID from token (auth/me) then get products.
            // Or maybe /api/products has a GET that filters by logged in user?

            // Temporary strategy: Get Brand ID first then fetch products
            const authRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                headers: { 'x-auth-token': token }
            });
            const brandId = authRes.data.brand.id;

            // Use the public route or brand-specific route
            // The public route is /api/brands/:username -> returns products. 
            // But we might want a direct /api/products/brand/:id
            // Let's assume we can fetch by brand ID.
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/brand/${brandId}`);
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setProducts(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            alert('Failed to delete product');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Products</h1>
                <Link href="/dashboard/products/new">
                    <button className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-800">
                        <Plus size={20} /> Add Product
                    </button>
                </Link>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : products.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-4">No products yet.</p>
                    <Link href="/dashboard/products/new">
                        <button className="text-black font-semibold hover:underline">Add your first product</button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                        <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group">
                            <div className="aspect-square bg-gray-100 relative">
                                {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDelete(product._id)}
                                        className="bg-white p-2 rounded-full text-red-500 shadow-sm hover:bg-red-50"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold truncate">{product.name}</h3>
                                <p className="text-sm text-gray-500">₦{product.price?.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
