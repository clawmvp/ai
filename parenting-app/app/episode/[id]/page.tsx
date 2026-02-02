"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, Circle, Play, Menu, X, Share2, Award, Sparkles } from 'lucide-react';
import { useProgress } from '@/hooks/useAppStore';
import courseData from '../../data/course_structure.json';


// Mock function to get content (In real app, fetch from API or look up in big JSON)
// Since we have content_glossary.json in public/data, we should fetch it or import it.
// BUT content_glossary.json is huge. For client side, maybe too big to bundle?
// We used to read it relative to FS in Server Component.
// But now I'm making this a Client Component to handle "Sidebar Toggle" state easily.
// I will fetch the specific content from an API route OR just fetch the big file once (cached).
// Actually, for simplicity/speed in this prototype, let's fetch the glossary file.

export default function EpisodePage() {
    const params = useParams();
    const id = params.id as string;

    const { markAsWatched, isWatched, toggleWatched } = useProgress();
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Find metadata from courseData
    const allEpisodes = courseData.chapters.flatMap(c => c.episodes.map(e => ({ ...e, chapterId: c.chapter_id })));
    const episodeMeta = allEpisodes.find(e => e.id.toString() === id.toString());
    const currentChapter = courseData.chapters.find(c => c.chapter_id === episodeMeta?.chapterId);

    // Fetch content
    useEffect(() => {
        if (!id) return;

        // Mark as watched on mount? No, maybe on click or manual.
        // Let's fetch content.
        fetch('/data/content_glossary.json')
            .then(res => res.json())
            .then(data => {
                const item = data.find((i: any) => i.id.toString() === id.toString());
                setContent(item);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (!episodeMeta) {
        return <div className="p-8 text-center">Episodul nu a fost găsit. <Link href="/" className="text-blue-500">Înapoi</Link></div>;
    }

    return (
        <div className="flex h-screen bg-white dark:bg-slate-900 font-sans overflow-hidden">
            {/* Sidebar (Desktop) */}
            <div className="hidden lg:flex w-80 flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                    <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-4">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm font-bold">Înapoi la Curs</span>
                    </Link>
                    <h2 className="font-bold text-slate-900 dark:text-white">
                        Capitolul {currentChapter?.chapter_id}
                    </h2>
                    <p className="text-xs text-slate-500 truncate">{currentChapter?.chapter_title}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {currentChapter?.episodes.map(e => (
                        <Link
                            key={e.id}
                            href={`/episode/${e.id}`}
                            className={`flex items-start gap-3 p-3 rounded-xl transition-all ${e.id.toString() === id.toString() ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                        >
                            <div className="mt-0.5">
                                {e.id.toString() === id.toString() ? (
                                    <Play className="h-4 w-4 fill-current" />
                                ) : isWatched(e.id) ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Circle className="h-4 w-4 opacity-30" />
                                )}
                            </div>
                            <span className="text-sm font-medium leading-tight">{e.title}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div className="w-64 bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <span className="font-bold">Cuprins</span>
                            <button onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {currentChapter?.episodes.map(e => (
                                <Link
                                    key={e.id}
                                    href={`/episode/${e.id}`}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-start gap-3 p-3 rounded-lg ${e.id.toString() === id.toString() ? 'bg-blue-50 text-blue-700' : ''}`}
                                >
                                    <span className="text-sm">{e.title}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)}></div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Mobile Header */}
                <div className="lg:hidden p-4 border-b flex items-center justify-between bg-white dark:bg-slate-900 z-10">
                    <Link href="/" className="p-2"><ArrowLeft className="h-5 w-5" /></Link>
                    <span className="font-bold truncate max-w-[200px]">{episodeMeta.title}</span>
                    <button onClick={() => setSidebarOpen(true)} className="p-2"><Menu className="h-5 w-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
                    <div className="max-w-3xl mx-auto px-6 py-12">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider mb-4">
                                <span>Episodul {allEpisodes.findIndex(e => e.id === episodeMeta.id) + 1}</span>
                                <span>•</span>
                                <span>{Math.floor(episodeMeta.duration / 60)} min</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                                {episodeMeta.title}
                            </h1>
                            <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                                {episodeMeta.description}
                            </p>
                        </div>

                        {/* Action Bar */}
                        <div className="flex items-center gap-4 py-6 border-y border-slate-100 dark:border-slate-800 mb-10">
                            <button
                                onClick={() => toggleWatched(episodeMeta.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${isWatched(episodeMeta.id) ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900'}`}
                            >
                                {isWatched(episodeMeta.id) ? (
                                    <>
                                        <CheckCircle className="h-5 w-5" />
                                        Vizionat
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5" />
                                        Marchează văzut
                                    </>
                                )}
                            </button>
                            <button className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors">
                                <Share2 className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content Area */}

                        {loading ? (
                            <div className="space-y-4 animate-pulse max-w-2xl">
                                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-200 rounded w-full"></div>
                                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                            </div>
                        ) : (
                            <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl mb-8 not-prose border border-blue-100 dark:border-blue-900/20">
                                    <h3 className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-300 mb-2">
                                        <Sparkles className="h-5 w-5" />
                                        Rezumat Glosar
                                    </h3>
                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                        {content?.text?.substring(0, 300)}...
                                    </p>
                                </div>

                                {/* Full Text Render */}
                                {content?.text?.split('\n').map((para: string, i: number) => (
                                    <p key={i}>{para}</p>
                                ))}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
