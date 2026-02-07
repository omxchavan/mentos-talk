'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { User, Mail, Shield, Loader2 } from 'lucide-react';
import { LoadingSpinner } from '@/components';
import { getInitials } from '@/lib/utils';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: 'mentor' | 'mentee';
    profilePhoto?: string;
}

export default function ProfilePage() {
    const { user } = useUser();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;

            try {
                const res = await fetch(`/api/users?clerkId=${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data.data);
                    setFormData({ name: data.data?.name || '' });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleSave = async () => {
        if (!profile) return;

        setIsSaving(true);
        try {
            const res = await fetch(`/api/users/${profile.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(data.data);
                setEditMode(false);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" text="Loading profile..." />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Profile</h1>
                <p className="text-muted-foreground">
                    Manage your account settings
                </p>
            </div>

            {/* Profile Card */}
            <div className="card p-8">
                {/* Avatar & Name */}
                <div className="flex items-center gap-6 mb-8">
                    {user?.imageUrl ? (
                        <img
                            src={user.imageUrl}
                            alt={user.fullName || 'Profile'}
                            className="w-20 h-20 rounded-2xl object-cover"
                        />
                    ) : (
                        <div className="avatar w-20 h-20 text-2xl rounded-2xl">
                            {getInitials(profile?.name || user?.fullName || 'U')}
                        </div>
                    )}
                    <div>
                        <h2 className="text-xl font-semibold">
                            {profile?.name || user?.fullName || 'User'}
                        </h2>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${profile?.role === 'mentor'
                                ? 'bg-secondary/10 text-secondary'
                                : 'bg-primary/10 text-primary'
                            }`}>
                            {profile?.role === 'mentor' ? '👨‍🏫 Mentor' : '🎓 Mentee'}
                        </span>
                    </div>
                </div>

                {/* Profile Info */}
                <div className="space-y-6">
                    {/* Name */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            Display Name
                        </label>
                        {editMode ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="input"
                            />
                        ) : (
                            <p className="text-muted-foreground">{profile?.name || 'Not set'}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            Email
                        </label>
                        <p className="text-muted-foreground">
                            {user?.primaryEmailAddress?.emailAddress || profile?.email}
                        </p>
                    </div>

                    {/* Role */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            Account Type
                        </label>
                        <p className="text-muted-foreground capitalize">
                            {profile?.role || 'Mentee'}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-border">
                    {editMode ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save Changes
                            </button>
                            <button
                                onClick={() => setEditMode(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditMode(true)}
                            className="btn-secondary"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
