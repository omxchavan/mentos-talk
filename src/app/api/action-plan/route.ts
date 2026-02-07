import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getGeminiAI, AI_PROMPTS } from '@/lib/gemini';

// POST - Generate action plan for user goal
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
        const { goal } = body;

        if (!goal) {
            return NextResponse.json(
                { success: false, error: 'Goal is required' },
                { status: 400 }
            );
        }

        let plan = '';

        try {
            const ai = getGeminiAI();
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: AI_PROMPTS.ACTION_PLAN + '\n\nUser\'s goal:\n' + goal,
            });

            plan = response.text;
        } catch (error) {
            console.error('Gemini API error:', error);
            // Fallback: provide generic plan template
            plan = `## Action Plan for: ${goal}

### Learning Steps:
1. Research and understand the fundamentals
2. Find learning resources (courses, tutorials)
3. Practice with hands-on projects
4. Seek feedback from mentors
5. Build a portfolio of work

### Recommended Resources:
- Online learning platforms (Coursera, Udemy)
- Documentation and official guides
- Community forums and Discord servers

### Timeline:
- Weeks 1-2: Foundation learning
- Weeks 3-4: Practice projects
- Month 2+: Advanced topics and specialization`;
        }

        return NextResponse.json({
            success: true,
            data: {
                plan,
                goal,
            },
        });
    } catch (error) {
        console.error('Error generating action plan:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate action plan' },
            { status: 500 }
        );
    }
}
