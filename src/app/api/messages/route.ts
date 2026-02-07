import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Message, User } from '@/models';

// GET - Get messages with a specific user
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const partnerId = searchParams.get('partnerId');

        if (!partnerId) {
            return NextResponse.json(
                { success: false, error: 'partnerId is required' },
                { status: 400 }
            );
        }

        // Get messages between the two users
        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: partnerId },
                { senderId: partnerId, receiverId: userId },
            ],
        }).sort({ timestamp: 1 });

        const data = messages.map(msg => ({
            id: msg._id,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            text: msg.text,
            timestamp: msg.timestamp.toISOString(),
            read: msg.read,
        }));

        // Mark messages as read
        await Message.updateMany(
            { senderId: partnerId, receiverId: userId, read: false },
            { $set: { read: true } }
        );

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

// POST - Send a message
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const body = await request.json();
        const { receiverId, text } = body;

        const message = await Message.create({
            senderId: userId,
            receiverId,
            text,
            timestamp: new Date(),
        });

        return NextResponse.json({
            success: true,
            data: {
                id: message._id,
                senderId: message.senderId,
                receiverId: message.receiverId,
                text: message.text,
                timestamp: message.timestamp.toISOString(),
                read: message.read,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
