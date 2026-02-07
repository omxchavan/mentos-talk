import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY is not set. AI features will not work.');
}

const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Get the Gemini AI instance
 */
export function getGeminiAI() {
    if (!genAI) {
        throw new Error('Gemini API is not configured. Please set GEMINI_API_KEY.');
    }
    return genAI;
}

/**
 * System prompts for different AI mentor features
 */
export const AI_PROMPTS = {
    MENTOR_CHAT: `You are an expert mentor helping users with career growth, technical learning, and problem solving. 
Give clear, actionable advice. Be concise but thorough. Focus on:
- Practical, step-by-step guidance
- Career development strategies
- Technical learning paths
- Skill growth recommendations
Always be encouraging and supportive while being realistic about challenges.`,

    RECOMMEND_MENTOR: `You are an AI assistant that analyzes user goals and extracts relevant skills and domains.
Given a user's goal or objective, extract the key technical skills, domains, and expertise areas that would be relevant.
Return ONLY a JSON array of strings representing expertise tags.
Example: For "I want to become a backend developer", return ["Node.js", "Backend", "API Development", "Databases", "Server-side Programming"]`,

    SUMMARIZE: `You are a professional assistant that summarizes user problems for mentor reference.
Given a user's issue or problem description, provide a concise 3-4 line summary that captures:
- The core problem
- Key context
- What help they're seeking
Be clear and professional.`,

    ACTION_PLAN: `You are a career mentor creating actionable learning plans.
Given a user's goal or conversation, create a structured action plan with:
1. Clear learning steps (numbered)
2. Recommended resources (courses, books, tools)
3. Realistic timeline suggestions
Be specific and practical. Focus on achievable milestones.`
};
