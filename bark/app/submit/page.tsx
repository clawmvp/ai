
'use client';

import React, { useState } from 'react';
import { Send, MapPin, Coffee, Trees, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SubmitPage() {
    const [formData, setFormData] = useState({
        name: '',
        type: 'park', // or 'pet_friendly'
        address: '',
        description: '',
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        // Simulate API call
        setTimeout(() => {
            console.log("Submitting data:", formData);
            // Here we would send data to the backend
            setStatus('success');
            setFormData({ name: '', type: 'park', address: '', description: '' });
        }, 1500);
    };

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans p-6 pb-20">
            <div className="max-w-md mx-auto">
                <div className="mb-8">
                    <Link href="/" className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-sm font-bold flex items-center gap-1">
                        &larr; Înapoi la Hartă
                    </Link>
                </div>

                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">Adaugă o Locație</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                    Știi un țarc sau un loc pet-friendly care lipsește? Ajută comunitatea să îl descopere!
                </p>

                {status === 'success' ? (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-6 rounded-2xl text-center">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Mulțumim!</h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">Sugestia ta a fost trimisă și va fi revizuită de un administrator în curând.</p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="text-emerald-600 font-bold hover:underline"
                        >
                            Adaugă încă o locație
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tipul Locației</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'park' })}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.type === 'park' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-200 text-slate-500'}`}
                                >
                                    <Trees size={24} />
                                    <span className="font-bold text-sm">Țarc / Parc</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'pet_friendly' })}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.type === 'pet_friendly' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' : 'border-slate-200 dark:border-slate-700 hover:border-orange-200 text-slate-500'}`}
                                >
                                    <Coffee size={24} />
                                    <span className="font-bold text-sm">Pet Friendly</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Numele Locației</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white"
                                placeholder="Ex: Parcul Central, Cafeneaua X..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Adresa (sau zona)</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white"
                                    placeholder="Ex: Strada Florilor nr. 4"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Descriere & Observații</label>
                            <textarea
                                rows={4}
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white"
                                placeholder="Ex: Au boluri cu apă, este umbră, e nevoie de lesă..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === 'submitting' ? 'Se trimite...' : <><Send size={18} /> Trimite Locația</>}
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
}
