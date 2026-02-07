import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models';

// GET - Get user by clerkId or list all users
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const clerkId = searchParams.get('clerkId');

        if (clerkId) {
            const user = await User.findOne({ clerkId });
            if (!user) {
                return NextResponse.json(
                    { success: false, error: 'User not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json({ success: true, data: user });
        }

        const users = await User.find().limit(50);
        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

// POST - Create a new user
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const body = await request.json();
        const { clerkId, role, name, email, profilePhoto } = body;

        // Check if user already exists
        const existingUser = await User.findOne({ clerkId });
        if (existingUser) {
            return NextResponse.json({ success: true, data: existingUser });
        }

        const user = await User.create({
            clerkId,
            role,
            name,
            email,
            profilePhoto,
        });

        return NextResponse.json({ success: true, data: user }, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create user' },
            { status: 500 }
        );
    }
}
