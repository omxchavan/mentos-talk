'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import {
    MessageSquare,
    Star,
    Users,
    TrendingUp,
    ArrowRight,
    Bot,
    Briefcase
} from 'lucide-react';
import { MentorCard, LoadingSpinner } from '@/components';
import { MentorCardData } from '@/types';

interface DashboardStats {
    totalMentors: number;
    totalMessages: number;
    avgRating: number;
}

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [topMentors, setTopMentors] = useState<MentorCardData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<'mentor' | 'mentee' | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch user profile to get role
                if (user?.id) {
                    const userRes = await fetch(`/api/users?clerkId=${user.id}`);
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        if (userData.success && userData.data) {
                            setUserRole(userData.data.role);
                        }
                    }
                }

                // Fetch top mentors
                const mentorsRes = await fetch('/api/mentors?limit=3&sortBy=rating');
                if (mentorsRes.ok) {
                    const mentorsData = await mentorsRes.json();
                    setTopMentors(mentorsData.data || []);
                }

                // Set placeholder stats
                setStats({
                    totalMentors: topMentors.length || 12,
                    totalMessages: 24,
                    avgRating: 4.8,
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isLoaded) {
            fetchDashboardData();
        }
    }, [user?.id, isLoaded]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" text="Loading dashboard..." />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {user?.firstName || 'there'}! 👋
                </h1>
                <p className="text-muted-foreground">
                    Here's what's happening with your mentoring journey.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Active Mentors"
                    value={stats?.totalMentors || 0}
                    icon={Users}
                    trend="+12%"
                    color="primary"
                />
                <StatCard
                    title="Messages"
                    value={stats?.totalMessages || 0}
                    icon={MessageSquare}
                    trend="+5"
                    color="secondary"
                />
                <StatCard
                    title="Average Rating"
                    value={stats?.avgRating.toFixed(1) || '0.0'}
                    icon={Star}
                    trend="★"
                    color="warning"
                />
                <StatCard
                    title="Growth Score"
                    value="85%"
                    icon={TrendingUp}
                    trend="+15%"
                    color="success"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                <Link href="/ai-mentor">
                    <div className="card p-6 group hover:border-primary/30 cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                    <Bot className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                        Chat with AI Mentor
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
                                        Get instant guidance and personalized advice
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                    </div>
                </Link>

                {userRole === 'mentor' ? (
                    <Link href="/profile">
                        <div className="card p-6 group hover:border-primary/30 cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center">
                                        <Briefcase className="w-7 h-7 text-secondary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                            My Mentor Profile
                                        </h3>
                                        <p className="text-muted-foreground text-sm">
                                            View and manage your mentor profile
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                    </Link>
                ) : (
                    <Link href="/mentors">
                        <div className="card p-6 group hover:border-primary/30 cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                                        <Users className="w-7 h-7 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                            Find a Mentor
                                        </h3>
                                        <p className="text-muted-foreground text-sm">
                                            Browse and connect with expert mentors
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                    </Link>
                )}
            </div>

            {/* Top Mentors */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold">Top Rated Mentors</h2>
                        <p className="text-muted-foreground text-sm">
                            Highly recommended by our community
                        </p>
                    </div>
                    <Link href="/mentors" className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1">
                        View all
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {topMentors.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topMentors.map((mentor) => (
                            <MentorCard key={mentor.id} mentor={mentor} />
                        ))}
                    </div>
                ) : (
                    <div className="card p-12 text-center">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">No mentors yet</h3>
                        <p className="text-muted-foreground text-sm">
                            Be the first to join as a mentor!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Stat Card Component
interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend: string;
    color: 'primary' | 'secondary' | 'success' | 'warning';
}

function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
    const colorClasses = {
        primary: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary/10 text-secondary',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
    };

    return (
        <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-success">{trend}</span>
            </div>
            <p className="text-2xl font-bold mb-1">{value}</p>
            <p className="text-muted-foreground text-sm">{title}</p>
        </div>
    );
}
