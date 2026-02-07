'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2, X, Plus } from 'lucide-react';

const suggestedExpertise = [
    'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript',
    'Data Science', 'Machine Learning', 'DevOps', 'Cloud Computing',
    'Product Management', 'UI/UX Design', 'Mobile Development',
    'Backend Development', 'Frontend Development', 'System Design',
    'Career Coaching', 'Interview Prep', 'Leadership', 'Entrepreneurship'
];

export default function MentorOnboardingPage() {
    const [formData, setFormData] = useState({
        bio: '',
        expertise: [] as string[],
        experience: '',
        availability: '',
    });
    const [customTag, setCustomTag] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingUser, setIsCheckingUser] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();
    const { user, isLoaded } = useUser();

    // Check if user already exists as mentor - redirect to dashboard if so
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
                        // User already exists
                        if (data.data.role === 'mentor') {
                            // Already a mentor, redirect to dashboard
                            router.push('/dashboard');
                            return;
                        }
                        // User is a mentee - they can proceed to become a mentor
                    }
                }
            } catch (error) {
                console.error('Error checking user:', error);
            }
            setIsCheckingUser(false);
        };

        checkExistingUser();
    }, [user?.id, isLoaded, router]);

    // Show loading while checking
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

    const handleExpertiseToggle = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            expertise: prev.expertise.includes(tag)
                ? prev.expertise.filter(t => t !== tag)
                : [...prev.expertise, tag]
        }));
    };

    const handleAddCustomTag = () => {
        if (customTag.trim() && !formData.expertise.includes(customTag.trim())) {
            setFormData(prev => ({
                ...prev,
                expertise: [...prev.expertise, customTag.trim()]
            }));
            setCustomTag('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Validation
        if (formData.expertise.length === 0) {
            setError('Please select at least one area of expertise');
            return;
        }
        if (!formData.bio.trim()) {
            setError('Please add a bio');
            return;
        }
        if (!formData.experience) {
            setError('Please enter your years of experience');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Create user first
            const userResponse = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clerkId: user.id,
                    role: 'mentor',
                    name: user.fullName || user.firstName || 'Mentor',
                    email: user.primaryEmailAddress?.emailAddress,
                    profilePhoto: user.imageUrl,
                }),
            });

            if (!userResponse.ok) {
                throw new Error('Failed to create user');
            }

            const userData = await userResponse.json();

            // Create mentor profile
            const profileResponse = await fetch('/api/mentors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userData.data._id,
                    bio: formData.bio,
                    expertise: formData.expertise,
                    experience: parseInt(formData.experience),
                    availability: formData.availability,
                    profilePhoto: user.imageUrl,
                }),
            });

            if (profileResponse.ok) {
                router.push('/dashboard');
            } else {
                throw new Error('Failed to create mentor profile');
            }
        } catch (err) {
            console.error('Error creating mentor profile:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 py-12">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">M</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Create Your Mentor Profile</h1>
                    <p className="text-muted-foreground">
                        Help mentees find you by sharing your expertise
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="card p-8 space-y-6">
                    {error && (
                        <div className="p-4 rounded-lg bg-error/10 text-error text-sm">
                            {error}
                        </div>
                    )}

                    {/* Bio */}
                    <div>
                        <label className="block font-medium mb-2">Bio</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                            placeholder="Tell mentees about yourself, your background, and what you can help with..."
                            rows={4}
                            maxLength={1000}
                            className="input resize-none"
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {formData.bio.length}/1000 characters
                        </p>
                    </div>

                    {/* Experience */}
                    <div>
                        <label className="block font-medium mb-2">Years of Experience</label>
                        <input
                            type="number"
                            value={formData.experience}
                            onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                            placeholder="e.g., 5"
                            min="0"
                            max="50"
                            className="input max-w-32"
                            required
                        />
                    </div>

                    {/* Expertise */}
                    <div>
                        <label className="block font-medium mb-2">Areas of Expertise</label>
                        <p className="text-sm text-muted-foreground mb-3">
                            Select your areas of expertise or add custom ones
                        </p>

                        {/* Selected tags */}
                        {formData.expertise.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {formData.expertise.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-white text-sm"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleExpertiseToggle(tag)}
                                            className="hover:bg-white/20 rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Add custom tag */}
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={customTag}
                                onChange={(e) => setCustomTag(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                                placeholder="Add custom expertise..."
                                className="input flex-1"
                            />
                            <button
                                type="button"
                                onClick={handleAddCustomTag}
                                className="btn-secondary px-4"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Suggested tags */}
                        <div className="flex flex-wrap gap-2">
                            {suggestedExpertise
                                .filter(tag => !formData.expertise.includes(tag))
                                .map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => handleExpertiseToggle(tag)}
                                        className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                                    >
                                        {tag}
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Availability */}
                    <div>
                        <label className="block font-medium mb-2">Availability</label>
                        <input
                            type="text"
                            value={formData.availability}
                            onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                            placeholder="e.g., Weekdays 6-9 PM EST, Weekends flexible"
                            className="input"
                            required
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating Profile...
                            </>
                        ) : (
                            'Create Mentor Profile'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
