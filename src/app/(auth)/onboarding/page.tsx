'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Users, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';

type Role = 'mentor' | 'mentee';

export default function OnboardingPage() {
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingUser, setIsCheckingUser] = useState(true);
    const router = useRouter();
    const { user, isLoaded } = useUser();

    // Check if user already exists in database - redirect to dashboard if so
    useEffect(() => {
        const checkExistingUser = async () => {
            if (!isLoaded || !user?.id) {
                setIsCheckingUser(false);
                return;
            }

            try {
                const res = await fetch(`/api/users?clerkId=${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data) {
                        // User already exists, redirect to dashboard
                        router.push('/dashboard');
                        return;
                    }
                }
            } catch (error) {
                console.error('Error checking user:', error);
            }
            setIsCheckingUser(false);
        };

        checkExistingUser();
    }, [user?.id, isLoaded, router]);

    // Show loading while checking if user exists
    if (isCheckingUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    const handleContinue = async () => {
        if (!selectedRole || !user) return;

        setIsLoading(true);
        try {
            // If mentor, go to profile creation
            // If mentee, create user and go to dashboard
            if (selectedRole === 'mentor') {
                // Store role in session and redirect to mentor profile creation
                sessionStorage.setItem('pendingRole', 'mentor');
                router.push('/onboarding/mentor');
            } else {
                // Create mentee user
                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        clerkId: user.id,
                        role: 'mentee',
                        name: user.fullName || user.firstName || 'User',
                        email: user.primaryEmailAddress?.emailAddress,
                        profilePhoto: user.imageUrl,
                    }),
                });

                if (response.ok) {
                    router.push('/dashboard');
                } else {
                    console.error('Failed to create user');
                }
            }
        } catch (error) {
            console.error('Onboarding error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">M</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Welcome to MentorConnect!</h1>
                    <p className="text-muted-foreground text-lg">
                        Let&apos;s get started. How would you like to use the platform?
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Mentee Option */}
                    <button
                        onClick={() => setSelectedRole('mentee')}
                        className={`card p-8 text-left transition-all ${selectedRole === 'mentee'
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'hover:border-primary/30'
                            }`}
                    >
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                            <GraduationCap className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">I&apos;m a Mentee</h3>
                        <p className="text-muted-foreground">
                            I want to learn from experienced mentors and grow my skills.
                        </p>
                    </button>

                    {/* Mentor Option */}
                    <button
                        onClick={() => setSelectedRole('mentor')}
                        className={`card p-8 text-left transition-all ${selectedRole === 'mentor'
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'hover:border-primary/30'
                            }`}
                    >
                        <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                            <Users className="w-7 h-7 text-secondary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">I&apos;m a Mentor</h3>
                        <p className="text-muted-foreground">
                            I want to share my expertise and help others grow.
                        </p>
                    </button>
                </div>

                <div className="text-center">
                    <button
                        onClick={handleContinue}
                        disabled={!selectedRole || isLoading}
                        className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Setting up...
                            </>
                        ) : (
                            <>
                                Continue
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
