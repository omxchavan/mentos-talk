'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, Star, X } from 'lucide-react';
import { MentorCard, LoadingSpinner } from '@/components';
import { MentorCardData } from '@/types';

const expertiseFilters = [
    'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript',
    'Data Science', 'Machine Learning', 'DevOps', 'Cloud Computing',
    'Product Management', 'UI/UX Design', 'Leadership'
];

const ratingFilters = [4, 3, 2, 1];

export default function MentorsPage() {
    const [mentors, setMentors] = useState<MentorCardData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
    const [minRating, setMinRating] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Fetch mentors
    useEffect(() => {
        const fetchMentors = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (searchQuery) params.append('search', searchQuery);
                if (selectedExpertise.length > 0) params.append('expertise', selectedExpertise.join(','));
                if (minRating) params.append('minRating', minRating.toString());

                const res = await fetch(`/api/mentors?${params.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    setMentors(data.data || []);
                }
            } catch (error) {
                console.error('Error fetching mentors:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMentors();
    }, [searchQuery, selectedExpertise, minRating]);

    // Search handler with manual debounce
    const handleSearchChange = (value: string) => {
        const timeoutId = setTimeout(() => setSearchQuery(value), 300);
        return () => clearTimeout(timeoutId);
    };

    const toggleExpertise = (expertise: string) => {
        setSelectedExpertise(prev =>
            prev.includes(expertise)
                ? prev.filter(e => e !== expertise)
                : [...prev, expertise]
        );
    };

    const clearFilters = () => {
        setSelectedExpertise([]);
        setMinRating(null);
        setSearchQuery('');
    };

    const hasActiveFilters = selectedExpertise.length > 0 || minRating !== null;

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Find a Mentor</h1>
                <p className="text-muted-foreground">
                    Browse our community of expert mentors and find the perfect match for your goals.
                </p>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name or expertise..."
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="input pl-12"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`btn-secondary inline-flex items-center gap-2 ${hasActiveFilters ? 'border-primary text-primary' : ''
                        }`}
                >
                    <Filter className="w-5 h-5" />
                    Filters
                    {hasActiveFilters && (
                        <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                            {selectedExpertise.length + (minRating ? 1 : 0)}
                        </span>
                    )}
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="card p-6 mb-6 animate-fadeIn">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Filters</h3>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                            >
                                <X className="w-4 h-4" />
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* Expertise Filter */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-3">Expertise</label>
                        <div className="flex flex-wrap gap-2">
                            {expertiseFilters.map((expertise) => (
                                <button
                                    key={expertise}
                                    onClick={() => toggleExpertise(expertise)}
                                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${selectedExpertise.includes(expertise)
                                        ? 'bg-primary text-white'
                                        : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                                        }`}
                                >
                                    {expertise}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rating Filter */}
                    <div>
                        <label className="block text-sm font-medium mb-3">Minimum Rating</label>
                        <div className="flex gap-2">
                            {ratingFilters.map((rating) => (
                                <button
                                    key={rating}
                                    onClick={() => setMinRating(minRating === rating ? null : rating)}
                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${minRating === rating
                                        ? 'bg-primary text-white'
                                        : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                                        }`}
                                >
                                    <Star className="w-4 h-4" />
                                    {rating}+
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {isLoading ? (
                <div className="flex items-center justify-center min-h-[40vh]">
                    <LoadingSpinner size="lg" text="Finding mentors..." />
                </div>
            ) : mentors.length > 0 ? (
                <>
                    <p className="text-sm text-muted-foreground mb-4">
                        Found {mentors.length} mentor{mentors.length !== 1 ? 's' : ''}
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mentors.map((mentor) => (
                            <MentorCard key={mentor.id} mentor={mentor} />
                        ))}
                    </div>
                </>
            ) : (
                <div className="card p-12 text-center">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No mentors found</h3>
                    <p className="text-muted-foreground mb-4">
                        Try adjusting your search or filters
                    </p>
                    <button onClick={clearFilters} className="btn-primary">
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
}
