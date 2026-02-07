import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AIChat } from '@/models';
import { getGeminiAI, AI_PROMPTS } from '@/lib/gemini';

// GET - Get AI chat history
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

        const chat = await AIChat.findOne({ userId }).sort({ updatedAt: -1 });

        return NextResponse.json({
            success: true,
            data: chat || { messages: [] },
        });
    } catch (error) {
        console.error('Error fetching AI chat:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch AI chat history' },
            { status: 500 }
        );
    }
}

// POST - Send message to AI mentor
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
        const { message } = body;

        if (!message) {
            return NextResponse.json(
                { success: false, error: 'Message is required' },
                { status: 400 }
            );
        }

        // Get or create chat session
        let chat = await AIChat.findOne({ userId });
        if (!chat) {
            chat = await AIChat.create({ userId, messages: [] });
        }

        // Add user message
        chat.messages.push({
            role: 'user',
            content: message,
            timestamp: new Date(),
        });

        // Generate AI response using new SDK
        let aiResponse = '';
        try {
            const ai = getGeminiAI();

            // Build conversation history
            const conversationHistory = [
                AI_PROMPTS.MENTOR_CHAT,
                ...chat.messages.map(msg => msg.content)
            ].join('\n\n');

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: conversationHistory,
            });

            aiResponse = response.text;
        } catch (error: any) {
            console.error('Gemini API error:', error);

            // Provide specific error messages based on error type
            if (error?.status === 429 || error?.message?.includes('quota')) {
                aiResponse = 'I apologize, but we\'ve reached the API rate limit. Please try again in a few moments.';
            } else {
                aiResponse = 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.';
            }
        }

        // Add AI response
        chat.messages.push({
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date(),
        });

        await chat.save();

        return NextResponse.json({
            success: true,
            data: {
                response: aiResponse,
                messages: chat.messages,
            },
        });
    } catch (error) {
        console.error('Error in AI chat:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process AI chat' },
            { status: 500 }
        );
    }
}
