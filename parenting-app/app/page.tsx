"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, CheckCircle, Circle, ChevronDown, ChevronRight, Search, BookOpen, Star, Sparkles } from 'lucide-react';
import { useProfile, useProgress } from '@/hooks/useAppStore';
import courseData from './data/course_structure.json';

export default function HomePage() {
  const { profile } = useProfile();
  const { progress, isWatched } = useProgress();
  const [expandedChapter, setExpandedChapter] = useState<number | null>(1); // Default expand first chapter

  // Find next episode or last played
  const lastPlayedId = progress.lastPlayedEpisodeId;
  let nextEpisode = null;

  // Flatten episodes for easier search
  const allEpisodes = courseData.chapters.flatMap(c => c.episodes.map(e => ({ ...e, chapterId: c.chapter_id })));

  if (lastPlayedId) {
    const idx = allEpisodes.findIndex(e => e.id === lastPlayedId);
    if (idx !== -1 && idx < allEpisodes.length - 1) {
      nextEpisode = allEpisodes[idx]; // Continue distinct episode or next? Usually continue same if not finished, but let's say "Continue"
    }
  }
  // Fallback to first if nothing played
  if (!nextEpisode && allEpisodes.length > 0) nextEpisode = allEpisodes[0];

  const toggleChapter = (id: number) => {
    setExpandedChapter(expandedChapter === id ? null : id);
  };

  // Calculate progress
  const totalEpisodes = allEpisodes.length;
  const watchedCount = progress.completedEpisodes.length;
  const progressPercent = Math.round((watchedCount / totalEpisodes) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 font-sans">
      {/* Header / Hero */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 pt-16 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                <span>Ediție Premium</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Salut, {profile.parentName || 'Părinte'}!
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                Continuă călătoria ta în parenting conștient.
              </p>
            </div>

            {/* Progress Card */}
            <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 md:w-64 flex-shrink-0">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Progres</span>
                <span className="text-2xl font-bold text-blue-600">{progressPercent}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">{watchedCount} din {totalEpisodes} episoade</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex gap-4">
            <Link href="/search" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-500/20">
              <Search className="h-5 w-5" />
              <span className="font-bold">Caută Răspunsuri AI</span>
            </Link>
            {nextEpisode && (
              <Link href={`/episode/${nextEpisode.id}`} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 text-slate-700 dark:text-white p-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Play className="h-5 w-5 fill-current" />
                <span className="font-medium">Continuă: {nextEpisode.title.substring(0, 20)}...</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-blue-500" />
          Curricula Cursului
        </h2>

        <div className="space-y-4">
          {courseData.chapters.map((chapter) => (
            <div key={chapter.chapter_id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleChapter(chapter.chapter_id)}
                className="w-full flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Capitolul {chapter.chapter_id}: {chapter.chapter_title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{chapter.episodes.length} episoade</p>
                </div>
                {expandedChapter === chapter.chapter_id ? (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                )}
              </button>

              {expandedChapter === chapter.chapter_id && (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {chapter.episodes.map((episode) => (
                    <Link key={episode.id} href={`/episode/${episode.id}`} className="flex items-start gap-4 p-5 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors group">
                      <div className="mt-1">
                        {isWatched(episode.id) ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-300 group-hover:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-base font-medium mb-1 ${isWatched(episode.id) ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-900 dark:text-white'}`}>
                          {episode.title}
                        </h4>
                        <p className="text-sm text-slate-500 line-clamp-2">{episode.description}</p>
                      </div>
                      <div className="text-xs font-mono text-slate-400 pt-1">
                        {Math.floor(episode.duration / 60)}m
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
