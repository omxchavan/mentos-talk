import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Message, User } from '@/models';

// GET - Get all conversations for the current user
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

        // Get all messages involving the current user
        const messages = await Message.find({
            $or: [{ senderId: userId }, { receiverId: userId }],
        }).sort({ timestamp: -1 });

        // Group by conversation partner
        const conversationsMap = new Map<string, {
            partnerId: string;
            lastMessage: string;
            lastMessageTime: Date;
            unreadCount: number;
        }>();

        messages.forEach(msg => {
            const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;

            if (!conversationsMap.has(partnerId)) {
                conversationsMap.set(partnerId, {
                    partnerId,
                    lastMessage: msg.text,
                    lastMessageTime: msg.timestamp,
                    unreadCount: 0,
                });
            }

            // Count unread messages
            if (msg.receiverId === userId && !msg.read) {
                const conv = conversationsMap.get(partnerId)!;
                conv.unreadCount++;
            }
        });

        // Get partner details
        const partnerIds = Array.from(conversationsMap.keys());
        const partners = await User.find({ clerkId: { $in: partnerIds } });
        const partnerMap = new Map(partners.map(p => [p.clerkId, p]));

        // Build response
        const data = Array.from(conversationsMap.entries()).map(([partnerId, conv]) => {
            const partner = partnerMap.get(partnerId);
            return {
                id: partnerId,
                participantId: partnerId,
                participantName: partner?.name || 'User',
                participantPhoto: partner?.profilePhoto,
                lastMessage: conv.lastMessage,
                lastMessageTime: conv.lastMessageTime.toISOString(),
                unreadCount: conv.unreadCount,
            };
        });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch conversations' },
            { status: 500 }
        );
    }
}
