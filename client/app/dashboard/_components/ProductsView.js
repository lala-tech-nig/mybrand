'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Plus, Trash2, Package } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ProductsView({ brand }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (brand) fetchProducts();
    }, [brand]);

    const fetchProducts = async () => {
        try {
            const brandId = brand._id || brand.id;
            const res = await api.get(`/api/products/brand/${brandId}`);
            setProducts(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/api/products/${id}`);
            setProducts(prev => prev.filter(p => p._id !== id));
            toast.success("Product deleted");
        } catch (err) {
            toast.error('Failed to delete product');
        }
    };

    if (loading) return <div className="text-zinc-500 font-bold uppercase tracking-widest animate-pulse py-12 text-center">Loading products...</div>;

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl font-black text-zinc-900">All Products ({products.length})</h3>
                <Link href="/dashboard/products/new" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-black/10">
                        <Plus size={18} /> Add New Product
                    </button>
                </Link>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-20 bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200">
                    <Package className="mx-auto h-16 w-16 text-zinc-300 mb-6" />
                    <h3 className="text-xl font-black text-zinc-900 mb-2">Inventory is empty</h3>
                    <p className="text-zinc-500 font-medium mb-8 max-w-xs mx-auto">You haven't added any products to your store yet. Start selling now!</p>
                    <Link href="/dashboard/products/new">
                        <button className="bg-[#FF6600] text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all">Create First Product</button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <div key={product._id} className="bg-white rounded-[2rem] border border-zinc-100 overflow-hidden hover:shadow-xl transition-all group relative">
                            <div className="h-64 md:h-56 bg-zinc-50 relative overflow-hidden">
                                {(product.images?.[0] || product.imageUrl) ? (
                                    <img src={product.images?.[0] || product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-zinc-200 bg-zinc-50"><Package size={48} /></div>
                                )}
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                    <button
                                        onClick={() => handleDelete(product._id)}
                                        className="bg-white/90 backdrop-blur-md p-3 rounded-2xl text-red-500 shadow-xl hover:bg-red-500 hover:text-white transition-all active:scale-90"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-black text-zinc-900 truncate flex-1 pr-2">{product.name}</h4>
                                    <div className="bg-zinc-50 px-2 py-1 rounded-lg text-[10px] font-black text-zinc-400 border border-zinc-100">STOCK</div>
                                </div>
                                <p className="text-[#FF6600] font-black text-xl mb-3">₦{product.price?.toLocaleString()}</p>
                                <p className="text-xs text-zinc-500 font-medium line-clamp-2 leading-relaxed">{product.description}</p>

                                <div className="mt-6 pt-6 border-t border-zinc-50 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Listing</span>
                                    <Link href={`/dashboard/products/edit/${product._id}`}>
                                        <button className="text-xs font-black text-zinc-900 hover:text-[#FF6600] transition-colors">EDIT PRODUCT</button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
