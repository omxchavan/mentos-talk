'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Bot,
    MessageSquare,
    User,
    LogOut,
    Menu,
    X,
    Briefcase
} from 'lucide-react';
import { useClerk, useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { getInitials } from '@/lib/utils';

// Helper hook to get user profile with role
function useUserProfile() {
    const { user, isLoaded } = useUser();
    const [profile, setProfile] = useState<{ role: 'mentor' | 'mentee' } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!isLoaded || !user?.id) {
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
                console.error('Error fetching profile:', error);
            }
            setIsLoading(false);
        };

        fetchProfile();
    }, [user?.id, isLoaded]);

    return { profile, isLoading, isMentor: profile?.role === 'mentor' };
}

export default function Sidebar() {
    const pathname = usePathname();
    const { signOut } = useClerk();
    const { user } = useUser();
    const { profile, isMentor, isLoading: isProfileLoading } = useUserProfile();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    // Base nav items for all users
    const baseNavItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/ai-mentor', label: 'AI Mentor', icon: Bot },
        { href: '/messages', label: 'Messages', icon: MessageSquare },
        { href: '/profile', label: 'Profile', icon: User },
    ];

    // Build nav items based on role
    const navItems = isMentor
        ? [
            ...baseNavItems.slice(0, 1), // Dashboard
            { href: '/mentors', label: 'All Mentors', icon: Users },
            ...baseNavItems.slice(1), // AI Mentor, Messages, Profile
        ]
        : [
            ...baseNavItems.slice(0, 1), // Dashboard
            { href: '/mentors', label: 'Find Mentors', icon: Users },
            ...baseNavItems.slice(1), // AI Mentor, Messages, Profile
        ];

    const NavContent = () => (
        <>
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <span className="text-xl font-bold gradient-text">MentorConnect</span>
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-smooth ${active
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted mb-3">
                    {user?.imageUrl ? (
                        <img
                            src={user.imageUrl}
                            alt={user.fullName || 'User'}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="avatar w-10 h-10 text-sm">
                            {getInitials(user?.fullName || 'User')}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user?.fullName || 'User'}</p>
                        <p className="text-xs text-muted-foreground">
                            {isMentor ? (
                                <span className="inline-flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" /> Mentor
                                </span>
                            ) : profile ? (
                                <span>Mentee</span>
                            ) : (
                                <span className="truncate">{user?.primaryEmailAddress?.emailAddress}</span>
                            )}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-error/10 hover:text-error transition-smooth"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border"
            >
                {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-card border-r border-border flex flex-col transform transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <NavContent />
            </aside>
        </>
    );
}

