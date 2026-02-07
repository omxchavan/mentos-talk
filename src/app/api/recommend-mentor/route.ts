import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MentorProfile } from '@/models';
import { getGeminiAI, AI_PROMPTS } from '@/lib/gemini';

// POST - Get mentor recommendations based on user goal
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
        const { goal } = body;

        if (!goal) {
            return NextResponse.json(
                { success: false, error: 'Goal is required' },
                { status: 400 }
            );
        }

        // Use Gemini to extract relevant skills/expertise
        let extractedTags: string[] = [];
        let explanation = '';

        try {
            const ai = getGeminiAI();
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: AI_PROMPTS.RECOMMEND_MENTOR + '\n\nUser goal: ' + goal,
            });

            const responseText = response.text;

            // Try to parse as JSON array
            try {
                const match = responseText.match(/\[[\s\S]*\]/);
                if (match) {
                    extractedTags = JSON.parse(match[0]);
                }
            } catch {
                // If parsing fails, extract keywords manually
                extractedTags = responseText
                    .replace(/[\[\]"]/g, '')
                    .split(',')
                    .map(s => s.trim())
                    .filter(s => s.length > 0);
            }

            explanation = `Based on your goal "${goal}", I'm looking for mentors with expertise in: ${extractedTags.join(', ')}`;
        } catch (error) {
            console.error('Gemini API error:', error);
            // Fallback to basic keyword extraction
            extractedTags = goal.split(/\s+/).filter((word: string) => word.length > 4);
            explanation = 'I\'ll find mentors that match your interests.';
        }

        // Find mentors matching the extracted tags
        const mentors = await MentorProfile.find({
            $or: [
                { expertise: { $in: extractedTags.map(t => new RegExp(t, 'i')) } },
                { bio: { $regex: extractedTags.join('|'), $options: 'i' } },
            ],
        })
            .sort({ avgRating: -1 })
            .limit(5)
            .populate('userId', 'name profilePhoto');

        const recommendations = mentors.map(mentor => {
            const user = mentor.userId as unknown as { name: string; profilePhoto?: string };
            const matchingTags = mentor.expertise.filter(e =>
                extractedTags.some(t => e.toLowerCase().includes(t.toLowerCase()))
            );

            return {
                mentor: {
                    id: mentor._id,
                    name: user?.name || 'Unknown',
                    profilePhoto: mentor.profilePhoto || user?.profilePhoto,
                    bio: mentor.bio,
                    expertise: mentor.expertise,
                    experience: mentor.experience,
                    avgRating: mentor.avgRating,
                    totalRatings: mentor.totalRatings,
                },
                matchScore: extractedTags.length > 0 ? (matchingTags.length / extractedTags.length) * 100 : 0,
                matchReason: matchingTags.length > 0
                    ? `Matches: ${matchingTags.join(', ')}`
                    : 'Related expertise',
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                response: explanation + (recommendations.length > 0
                    ? `\n\nI found ${recommendations.length} mentor(s) that might be a great fit for you!`
                    : '\n\nNo exact matches found, but check out our top-rated mentors.'),
                extractedTags,
                recommendations: recommendations.sort((a, b) => b.matchScore - a.matchScore),
            },
        });
    } catch (error) {
        console.error('Error recommending mentors:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to recommend mentors' },
            { status: 500 }
        );
    }
}
