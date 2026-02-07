import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MentorProfile, User } from '@/models';

// GET - List mentors with search/filter
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const expertise = searchParams.get('expertise');
        const minRating = searchParams.get('minRating');
        const limit = parseInt(searchParams.get('limit') || '20');
        const sortBy = searchParams.get('sortBy');

        // Build query
        const query: Record<string, unknown> = {};

        if (expertise) {
            const tags = expertise.split(',');
            query.expertise = { $in: tags };
        }

        if (minRating) {
            query.avgRating = { $gte: parseFloat(minRating) };
        }

        // Build sort
        const sort: Record<string, 1 | -1> = {};
        if (sortBy === 'rating') {
            sort.avgRating = -1;
        } else {
            sort.createdAt = -1;
        }

        // Fetch mentors
        let mentors = await MentorProfile.find(query)
            .sort(sort)
            .limit(limit)
            .populate('userId', 'name email profilePhoto');

        // Search filter (name)
        if (search) {
            const searchLower = search.toLowerCase();
            mentors = mentors.filter(mentor => {
                const user = mentor.userId as unknown as { name: string };
                return (
                    user?.name?.toLowerCase().includes(searchLower) ||
                    mentor.expertise.some(e => e.toLowerCase().includes(searchLower)) ||
                    mentor.bio.toLowerCase().includes(searchLower)
                );
            });
        }

        // Transform response
        const data = mentors.map(mentor => {
            const user = mentor.userId as unknown as { _id: string; name: string; profilePhoto?: string };
            return {
                id: mentor._id,
                name: user?.name || 'Unknown',
                profilePhoto: mentor.profilePhoto || user?.profilePhoto,
                bio: mentor.bio,
                expertise: mentor.expertise,
                experience: mentor.experience,
                avgRating: mentor.avgRating,
                totalRatings: mentor.totalRatings,
            };
        });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching mentors:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch mentors' },
            { status: 500 }
        );
    }
}

// POST - Create mentor profile
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const body = await request.json();
        const { userId, bio, expertise, experience, availability, profilePhoto } = body;

        // Check if profile already exists
        const existingProfile = await MentorProfile.findOne({ userId });
        if (existingProfile) {
            return NextResponse.json({ success: true, data: existingProfile });
        }

        const profile = await MentorProfile.create({
            userId,
            bio,
            expertise,
            experience,
            availability,
            profilePhoto,
        });

        return NextResponse.json({ success: true, data: profile }, { status: 201 });
    } catch (error) {
        console.error('Error creating mentor profile:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create mentor profile' },
            { status: 500 }
        );
    }
}
