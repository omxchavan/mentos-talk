import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.text();
        const [socketId, channelName] = data
            .split('&')
            .map((str) => str.split('=')[1]);

        // Authorize the user for private channels
        const authResponse = pusherServer.authorizeChannel(
            decodeURIComponent(socketId),
            decodeURIComponent(channelName)
        );

        return NextResponse.json(authResponse);
    } catch (error) {
        console.error('Pusher auth error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
