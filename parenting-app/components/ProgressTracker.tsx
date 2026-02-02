"use client";
import { useProgress } from '../hooks/useAppStore';
import { CheckCircle, Circle } from 'lucide-react';

export function ProgressTracker({ episodeId }: { episodeId: number }) {
    const { isWatched, toggleWatched } = useProgress();
    const watched = isWatched(episodeId);

    return (
        <button
            onClick={() => toggleWatched(episodeId)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${watched
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
        >
            {watched ? (
                <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Vizionat</span>
                </>
            ) : (
                <>
                    <Circle className="h-5 w-5" />
                    <span>Marchează ca vizionat</span>
                </>
            )}
        </button>
    );
}
