"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useProfile } from '../../hooks/useAppStore';

interface SearchResult {
    id: number | string;
    title: string;
    text: string;
    score: number;
}

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [answer, setAnswer] = useState('');
    const [keyPoints, setKeyPoints] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [workerReady, setWorkerReady] = useState(false);
    const [workerError, setWorkerError] = useState<string | null>(null);
    const [pendingQuery, setPendingQuery] = useState<string | null>(null);
    const workerRef = useRef<Worker | null>(null);

    const { profile } = useProfile();

    useEffect(() => {
        workerRef.current = new Worker('/search_worker.js', { type: 'module' });
        workerRef.current.onmessage = (event) => {
            const { type, data, keyPoints } = event.data;
            if (type === 'ready') {
                setWorkerReady(true);
            } else if (type === 'results') {
                setResults(data);
                setIsSearching(false);
                if (keyPoints) setKeyPoints(keyPoints);
            } else if (type === 'answer') {
                setAnswer(data);
            } else if (type === 'error') {
                console.error("Worker Error:", data);
                setWorkerError("Eroare la încărcarea AI. Reîncearcă.");
                setIsSearching(false);
            }
        };
        workerRef.current.onerror = (err) => {
            console.error("Worker failed:", err);
            setWorkerError("Eroare critică worker.");
            setIsSearching(false);
        };
        try {
            workerRef.current.postMessage({ type: 'init' });
        } catch (e) {
            console.error("Worker init failed", e);
            setWorkerError("Nu s-a putut inițializa AI.");
        }
        return () => { workerRef.current?.terminate(); };
    }, []);

    // Execute pending query when worker becomes ready
    useEffect(() => {
        if (workerReady && pendingQuery) {
            performSearch(pendingQuery);
            setPendingQuery(null);
        }
    }, [workerReady, pendingQuery]);

    const performSearch = (searchQuery: string) => {
        setIsSearching(true);
        setAnswer('');
        setKeyPoints([]);

        let searchContext = "";
        // Safely access profile properties
        if (profile?.childName && profile?.childAge) {
            searchContext = ` (Context: Copilul are ${profile.childAge} ani, îl cheamă ${profile.childName})`;
        }

        workerRef.current?.postMessage({
            type: 'search',
            query: searchQuery + searchContext
        });
    };

    const handleSearch = (e?: React.FormEvent, overrideQuery?: string) => {
        if (e) e.preventDefault();
        const q = overrideQuery || query;

        if (!q.trim()) return;

        if (!workerReady) {
            setPendingQuery(q);
            setIsSearching(true);
            setAnswer('Se inițializează modelele AI, te rugăm să aștepți câteva secunde...');
            return;
        }

        performSearch(q);
    };

    const handleChipClick = (tag: string) => {
        setQuery(tag);
        handleSearch(undefined, tag);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 font-sans">
            {/* Hero */}
            <div className="pt-24 pb-12 px-4 text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                    <Sparkles className="h-4 w-4" />
                    <span>Parenting AI Assistant</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                    Cum te putem ajuta?
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Găsește răspunsuri rapide și clare din cursurile noastre.
                </p>

                <form onSubmit={(e) => handleSearch(e)} className="relative max-w-2xl mx-auto">
                    {/* Flex Container for Robust Input Group - No Z-Index issues */}
                    <div className={`flex items-center gap-3 bg-white dark:bg-slate-800 border ${workerError ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'} rounded-2xl shadow-lg shadow-blue-500/5 p-2 pr-3 focus-within:ring-2 focus-within:ring-blue-500 transition-all`}>
                        <div className={`pl-3 ${workerError ? 'text-red-500' : 'text-slate-400'}`}>
                            <Search className="h-6 w-6" />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={workerError ? "AI Indisponibil" : "Întreabă orice (ex: tantrum)..."}
                            className="flex-1 bg-transparent border-none outline-none text-lg text-slate-900 dark:text-white placeholder:text-slate-400 py-3 min-w-0"
                            autoComplete="off"
                        />
                        <div className="flex-shrink-0">
                            {isSearching && !pendingQuery ? (
                                <div className="p-2">
                                    <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={!query.trim()}
                                    className={`p-3 ${workerError ? 'bg-red-500' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl transition-colors disabled:opacity-50 cursor-pointer active:scale-95`}
                                    title={workerError || "Caută"}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </form>
                {workerError && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-800">
                        {workerError} <button onClick={() => window.location.reload()} className="underline ml-2">Reîncearcă</button>
                    </div>
                )}
            </div>

            <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    {(answer || keyPoints.length > 0) && (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-600/20">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Rezumat AI</h2>
                                </div>
                            </div>

                            <div className="prose prose-blue dark:prose-invert max-w-none mb-8">
                                <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                                    {answer || "Generează..."}
                                </p>
                            </div>

                            {keyPoints.length > 0 && (
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                                        Idei Principale
                                    </h3>
                                    <ul className="space-y-3">
                                        {keyPoints.map((point, i) => (
                                            <li key={i} className="flex gap-3 text-slate-700 dark:text-slate-300 leading-snug">
                                                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shadow-sm">
                                                    {i + 1}
                                                </span>
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white px-2">
                                Surse Relevante
                            </h3>
                            {results.map((result) => (
                                <Link href={`/episode/${result.id}`} key={result.id} className="block group">
                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                {result.title}
                                            </h4>
                                            {result.score > 0.65 && (
                                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">
                                                    Match
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
                                            {result.text}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 sticky top-24">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                            Explorează
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {['Limitele', 'Somnul', 'Emoții', 'Tantrum', 'Conectare'].map(tag => (
                                <button key={tag} onClick={() => handleChipClick(tag)} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors border border-slate-200 dark:border-slate-800 cursor-pointer active:scale-95">
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
