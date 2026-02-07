'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import {
    ArrowLeft,
    MessageSquare,
    Star,
    Clock,
    Briefcase,
    Calendar,
    Loader2
} from 'lucide-react';
import { StarRating, ReviewCard, LoadingSpinner } from '@/components';
import { MentorDetailData, ReviewData } from '@/types';
import { getInitials } from '@/lib/utils';

export default function MentorProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const mentorId = params.id as string;

    const [mentor, setMentor] = useState<MentorDetailData | null>(null);
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 0, comment: '' });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchMentorData = async () => {
            try {
                // Fetch mentor profile
                const mentorRes = await fetch(`/api/mentors/${mentorId}`);
                if (mentorRes.ok) {
                    const mentorData = await mentorRes.json();
                    setMentor(mentorData.data);
                }

                // Fetch reviews
                const reviewsRes = await fetch(`/api/reviews?mentorId=${mentorId}`);
                if (reviewsRes.ok) {
                    const reviewsData = await reviewsRes.json();
                    setReviews(reviewsData.data || []);
                }
            } catch (error) {
                console.error('Error fetching mentor data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (mentorId) {
            fetchMentorData();
        }
    }, [mentorId]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !mentor) return;

        setIsSubmittingReview(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mentorId: mentor.id,
                    clerkId: user.id,
                    rating: reviewData.rating,
                    comment: reviewData.comment,
                }),
            });

            if (res.ok) {
                const newReview = await res.json();
                setReviews(prev => [newReview.data, ...prev]);
                setShowReviewForm(false);
                setReviewData({ rating: 0, comment: '' });
                // Refresh mentor data to get updated rating
                const mentorRes = await fetch(`/api/mentors/${mentorId}`);
                if (mentorRes.ok) {
                    const mentorData = await mentorRes.json();
                    setMentor(mentorData.data);
                }
            }
        } catch (error) {
            console.error('Error submitting review:', error);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" text="Loading mentor profile..." />
            </div>
        );
    }

    if (!mentor) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">Mentor not found</h2>
                <button onClick={() => router.back()} className="btn-primary">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to mentors
            </button>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Header */}
                    <div className="card p-8">
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            {mentor.profilePhoto ? (
                                <img
                                    src={mentor.profilePhoto}
                                    alt={mentor.name}
                                    className="w-24 h-24 rounded-2xl object-cover"
                                />
                            ) : (
                                <div className="avatar w-24 h-24 text-2xl rounded-2xl">
                                    {getInitials(mentor.name)}
                                </div>
                            )}
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold mb-2">{mentor.name}</h1>
                                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 star-filled fill-current" />
                                        <span className="font-medium text-foreground">
                                            {mentor.avgRating.toFixed(1)}
                                        </span>
                                        <span>({mentor.totalRatings} reviews)</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Briefcase className="w-4 h-4" />
                                        <span>{mentor.experience} years</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {mentor.expertise.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About */}
                    <div className="card p-6">
                        <h2 className="font-semibold text-lg mb-4">About</h2>
                        <p className="text-muted-foreground whitespace-pre-wrap">{mentor.bio}</p>
                    </div>

                    {/* Reviews Section */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-semibold text-lg">
                                Reviews ({reviews.length})
                            </h2>
                            <button
                                onClick={() => setShowReviewForm(!showReviewForm)}
                                className="btn-secondary text-sm"
                            >
                                Write Review
                            </button>
                        </div>

                        {/* Review Form */}
                        {showReviewForm && (
                            <form onSubmit={handleSubmitReview} className="mb-6 p-4 rounded-xl bg-muted">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Rating</label>
                                    <StarRating
                                        rating={reviewData.rating}
                                        onRatingChange={(r) => setReviewData(prev => ({ ...prev, rating: r }))}
                                        size="lg"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Comment</label>
                                    <textarea
                                        value={reviewData.comment}
                                        onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                                        placeholder="Share your experience with this mentor..."
                                        rows={3}
                                        className="input resize-none"
                                        required
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={reviewData.rating === 0 || isSubmittingReview}
                                        className="btn-primary inline-flex items-center gap-2"
                                    >
                                        {isSubmittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Submit Review
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowReviewForm(false)}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Reviews List */}
                        {reviews.length > 0 ? (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                No reviews yet. Be the first to review!
                            </p>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Chat CTA */}
                    <div className="card p-6">
                        <Link
                            href={`/chat/${mentor.userId}`}
                            className="btn-primary w-full py-4 text-center inline-flex items-center justify-center gap-2"
                        >
                            <MessageSquare className="w-5 h-5" />
                            Start Chat
                        </Link>
                    </div>

                    {/* Availability */}
                    <div className="card p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Availability
                        </h3>
                        <p className="text-muted-foreground">{mentor.availability}</p>
                    </div>

                    {/* Stats */}
                    <div className="card p-6">
                        <h3 className="font-semibold mb-4">Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Sessions</span>
                                <span className="font-medium">{mentor.totalSessions}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Reviews</span>
                                <span className="font-medium">{mentor.totalRatings}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Experience</span>
                                <span className="font-medium">{mentor.experience} years</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
