
'use client';

import React, { useState } from 'react';
import { Shield, Check, X, MapPin, Trash2, Coffee, Trees } from 'lucide-react';
import Link from 'next/link';

// Mock data for demo
const MOCK_SUBMISSIONS = [
    { id: 1, name: 'Teren Viran Colentina', type: 'park', address: 'Strada Fructelor', description: 'E un teren mare unde ne strângem cu câinii seara.', status: 'pending' },
    { id: 2, name: 'Burger Van Bistro', type: 'pet_friendly', address: 'Strada George Vraca 4', description: 'Au burgeri buni și primesc câini înăuntru.', status: 'pending' },
    { id: 3, name: 'Parcul Carol (Zona Nouă)', type: 'park', address: 'Parcul Carol I', description: 'S-a deschis o zonă nouă lângă arenă.', status: 'pending' },
];

export default function AdminPage() {
    const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS);

    const handleAction = (id: number, action: 'approve' | 'reject') => {
        // In a real app, this would call an API
        setSubmissions(submissions.filter(s => s.id !== id));
        // Show toast or notification
    };

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans p-6 pb-20">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-sm font-bold flex items-center gap-1">
                        &larr; Înapoi la Hartă
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                        <Shield size={12} /> Admin Mode
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-6">Administrare Locații</h1>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h2 className="font-bold text-lg text-slate-800 dark:text-white">Aprobări În Așteptare</h2>
                        <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-bold">{submissions.length}</span>
                    </div>

                    {submissions.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <Check size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Totul e la zi! Nu sunt sugestii noi.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {submissions.map((item) => (
                                <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-4 sm:items-start justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.type === 'park' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {item.type === 'park' ? <Trees size={20} /> : <Coffee size={20} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-white mb-1">{item.name}</h3>
                                            <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                                                <span className="flex items-center gap-1"><MapPin size={12} /> {item.address}</span>
                                                <span className="uppercase tracking-wider font-bold opacity-70">{item.type}</span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-300 text-sm bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 italic">
                                                "{item.description}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 sm:self-center">
                                        <button
                                            onClick={() => handleAction(item.id, 'reject')}
                                            className="p-2 hover:bg-red-100 hover:text-red-600 text-slate-400 rounded-lg transition-colors"
                                            title="Respinge"
                                        >
                                            <X size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleAction(item.id, 'approve')}
                                            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                        >
                                            <Check size={16} /> Aprobă
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
