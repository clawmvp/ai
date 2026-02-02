"use client";
import { useProgress } from '../hooks/useAppStore';
import { Award } from 'lucide-react';

export function ProgressDashboard() {
    const { progress } = useProgress();
    // Assuming a fixed number of episodes for now or calculating dynamically if we passed total count
    // For demo, we just show count
    const count = progress.completedEpisodes.length;

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">Progresul Tău</h3>
                <p className="text-gray-500 text-sm">Ai finalizat {count} lecții</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6" />
            </div>
        </div>
    );
}
