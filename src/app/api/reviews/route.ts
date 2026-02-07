import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Review, MentorProfile, User } from '@/models';

// GET - Get reviews for a mentor
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const mentorId = searchParams.get('mentorId');

        if (!mentorId) {
            return NextResponse.json(
                { success: false, error: 'mentorId is required' },
                { status: 400 }
            );
        }

        const reviews = await Review.find({ mentorId })
            .sort({ createdAt: -1 })
            .populate('userId', 'name profilePhoto');

        const data = reviews.map(review => {
            const user = review.userId as unknown as { _id: string; name: string; profilePhoto?: string };
            return {
                id: review._id,
                userId: user?._id,
                userName: user?.name || 'Anonymous',
                userPhoto: user?.profilePhoto,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt.toISOString(),
            };
        });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch reviews' },
            { status: 500 }
        );
    }
}

// POST - Create a review
export async function POST(request: NextRequest) {
    try {
        const { userId: authUserId } = await auth();
        if (!authUserId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const body = await request.json();
        const { mentorId, clerkId, rating, comment } = body;

        // Find user by clerkId
        const user = await User.findOne({ clerkId });
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if user already reviewed this mentor
        const existingReview = await Review.findOne({
            mentorId,
            userId: user._id,
        });

        if (existingReview) {
            return NextResponse.json(
                { success: false, error: 'You have already reviewed this mentor' },
                { status: 400 }
            );
        }

        // Create review
        const review = await Review.create({
            mentorId,
            userId: user._id,
            rating,
            comment,
        });

        // Update mentor's average rating
        const allReviews = await Review.find({ mentorId });
        const totalRatings = allReviews.length;
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

        await MentorProfile.findByIdAndUpdate(mentorId, {
            avgRating: Math.round(avgRating * 10) / 10,
            totalRatings,
        });

        return NextResponse.json({
            success: true,
            data: {
                id: review._id,
                userId: user._id,
                userName: user.name,
                userPhoto: user.profilePhoto,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt.toISOString(),
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create review' },
            { status: 500 }
        );
    }
}
