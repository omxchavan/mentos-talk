import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MentorProfile } from '@/models';

// GET - Get mentor profile by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;

        const mentor = await MentorProfile.findById(id)
            .populate('userId', 'name email profilePhoto clerkId');

        if (!mentor) {
            return NextResponse.json(
                { success: false, error: 'Mentor not found' },
                { status: 404 }
            );
        }

        const user = mentor.userId as unknown as {
            _id: string;
            name: string;
            profilePhoto?: string;
            clerkId: string;
        };

        return NextResponse.json({
            success: true,
            data: {
                id: mentor._id,
                userId: user?.clerkId || user?._id,
                name: user?.name || 'Unknown',
                profilePhoto: mentor.profilePhoto || user?.profilePhoto,
                bio: mentor.bio,
                expertise: mentor.expertise,
                experience: mentor.experience,
                availability: mentor.availability,
                avgRating: mentor.avgRating,
                totalRatings: mentor.totalRatings,
                totalSessions: mentor.totalSessions,
            },
        });
    } catch (error) {
        console.error('Error fetching mentor:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch mentor' },
            { status: 500 }
        );
    }
}

// PATCH - Update mentor profile
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const body = await request.json();

        const mentor = await MentorProfile.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        );

        if (!mentor) {
            return NextResponse.json(
                { success: false, error: 'Mentor not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: mentor });
    } catch (error) {
        console.error('Error updating mentor:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update mentor' },
            { status: 500 }
        );
    }
}
