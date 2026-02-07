import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getGeminiAI, AI_PROMPTS } from '@/lib/gemini';

// POST - Summarize user problem for mentor reference
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { issue } = body;

        if (!issue) {
            return NextResponse.json(
                { success: false, error: 'Issue description is required' },
                { status: 400 }
            );
        }

        let summary = '';

        try {
            const ai = getGeminiAI();
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: AI_PROMPTS.SUMMARIZE + '\n\nUser\'s issue:\n' + issue,
            });

            summary = response.text;
        } catch (error) {
            console.error('Gemini API error:', error);
            // Fallback: create basic summary
            summary = issue.length > 200
                ? issue.substring(0, 200) + '...'
                : issue;
        }

        return NextResponse.json({
            success: true,
            data: {
                summary,
                originalLength: issue.length,
                summaryLength: summary.length,
            },
        });
    } catch (error) {
        console.error('Error summarizing issue:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to summarize issue' },
            { status: 500 }
        );
    }
}
