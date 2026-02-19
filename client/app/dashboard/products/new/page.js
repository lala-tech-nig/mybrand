'use client';

import React, { useState } from 'react';
import api from '../../../../utils/api';
import { useRouter } from 'next/navigation';
import { Upload, X } from 'lucide-react';

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: ''
    });
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            alert('You can only upload up to 5 images');
            return;
        }

        const newImages = [...images, ...files];
        setImages(newImages);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            data.append('name', formData.name);
            data.append('price', formData.price);
            data.append('description', formData.description);

            images.forEach(image => {
                data.append('images', image);
            });

            await api.post('/api/products', data);
            router.push('/dashboard/products');
        } catch (err) {
            console.error(err);
            alert('Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold mb-6 text-zinc-900">Add New Product</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-zinc-700">Product Name</label>
                    <input
                        type="text"
                        name="name"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-700">Price (₦)</label>
                    <input
                        type="number"
                        name="price"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        value={formData.price}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Product Images (Max 5)</label>
                    <div className="flex flex-wrap gap-4">
                        {previews.map((preview, index) => (
                            <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-500 shadow-sm hover:bg-gray-100"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        {images.length < 5 && (
                            <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                                <Upload className="text-gray-400 mb-1" size={20} />
                                <span className="text-xs text-gray-500">Upload</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-700">Description</label>
                    <textarea
                        name="description"
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Creating...' : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}
