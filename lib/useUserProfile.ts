'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface UserProfile {
    _id: string;
    clerkId: string;
    name: string;
    email: string;
    role: 'mentor' | 'mentee';
    profilePhoto?: string;
}

interface UseUserProfileResult {
    profile: UserProfile | null;
    isLoading: boolean;
    isMentor: boolean;
    isMentee: boolean;
    refetch: () => Promise<void>;
}

export function useUserProfile(): UseUserProfileResult {
    const { user, isLoaded } = useUser();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async () => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`/api/users?clerkId=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.data) {
                    setProfile(data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded) {
            fetchProfile();
        }
    }, [user?.id, isLoaded]);

    return {
        profile,
        isLoading: !isLoaded || isLoading,
        isMentor: profile?.role === 'mentor',
        isMentee: profile?.role === 'mentee',
        refetch: fetchProfile,
    };
}
