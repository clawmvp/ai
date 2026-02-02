import { useLocalStorage } from './useLocalStorage';

export interface ChildProfile {
    parentName: string;
    childName: string;
    childAge: string;
    onboarded: boolean;
}

export interface UserProgress {
    completedEpisodes: number[]; // Array of episode IDs
    lastPlayedEpisodeId: number | null;
}

export function useProfile() {
    const [profile, setProfile] = useLocalStorage<ChildProfile>('parenting-app-profile', {
        parentName: '',
        childName: '',
        childAge: '',
        onboarded: false,
    });

    const updateProfile = (newProfile: Partial<ChildProfile>) => {
        setProfile((prev) => ({ ...prev, ...newProfile }));
    };

    return { profile, updateProfile };
}

export function useProgress() {
    const [progress, setProgress] = useLocalStorage<UserProgress>('parenting-app-progress', {
        completedEpisodes: [],
        lastPlayedEpisodeId: null,
    });

    const markAsWatched = (episodeId: number) => {
        setProgress((prev) => {
            if (prev.completedEpisodes.includes(episodeId)) return prev;
            return { ...prev, completedEpisodes: [...prev.completedEpisodes, episodeId] };
        });
    };

    const markAsUnwatched = (episodeId: number) => {
        setProgress((prev) => ({
            ...prev,
            completedEpisodes: prev.completedEpisodes.filter((id) => id !== episodeId),
        }));
    };

    const toggleWatched = (episodeId: number) => {
        if (progress.completedEpisodes.includes(episodeId)) {
            markAsUnwatched(episodeId);
        } else {
            markAsWatched(episodeId);
        }
    };

    const isWatched = (episodeId: number) => progress.completedEpisodes.includes(episodeId);

    return { progress, markAsWatched, markAsUnwatched, toggleWatched, isWatched };
}
