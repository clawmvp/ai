"use client";

import { useState, useEffect } from "react";
import { ProfileModal } from "./ProfileModal";
import { useProfile } from "../hooks/useAppStore";

export function ProfileWrapper() {
    const { profile } = useProfile();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!profile.onboarded) {
            setIsOpen(true);
        }
    }, [profile.onboarded]);

    return <ProfileModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
