'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Bot, Sparkles, Target, FileText, Lightbulb } from 'lucide-react';
import { ChatUI, LoadingSpinner } from '@/components';
import { AIChatMessageData } from '@/types';

type AIFeature = 'chat' | 'recommend' | 'summarize' | 'action-plan';

const features = [
    {
        id: 'chat' as AIFeature,
        name: 'AI Chat',
        description: 'Get mentoring advice on any topic',
        icon: Bot,
    },
    {
        id: 'recommend' as AIFeature,
        name: 'Mentor Match',
        description: 'Find mentors based on your goals',
        icon: Target,
    },
    {
        id: 'summarize' as AIFeature,
        name: 'Summarize',
        description: 'Summarize your problem for mentors',
        icon: FileText,
    },
    {
        id: 'action-plan' as AIFeature,
        name: 'Action Plan',
        description: 'Get a personalized learning plan',
        icon: Lightbulb,
    },
];

export default function AIMentorPage() {
    const { user } = useUser();
    const [activeFeature, setActiveFeature] = useState<AIFeature>('chat');
    const [messages, setMessages] = useState<AIChatMessageData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Load chat history
    useEffect(() => {
        const loadHistory = async () => {
            if (!user) return;
            try {
                const res = await fetch('/api/ai-chat');
                if (res.ok) {
                    const data = await res.json();
                    if (data.data?.messages) {
                        setMessages(data.data.messages);
                    }
                }
            } catch (error) {
                console.error('Error loading chat history:', error);
            } finally {
                setInitialLoading(false);
            }
        };
        loadHistory();
    }, [user]);

    const handleSendMessage = useCallback(async (text: string) => {
        if (!user) return;

        // Add user message immediately
        const userMessage: AIChatMessageData = {
            role: 'user',
            content: text,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            let endpoint = '/api/ai-chat';
            let body: Record<string, string> = { message: text };

            // Use different endpoints based on feature
            switch (activeFeature) {
                case 'recommend':
                    endpoint = '/api/recommend-mentor';
                    body = { goal: text };
                    break;
                case 'summarize':
                    endpoint = '/api/summarize';
                    body = { issue: text };
                    break;
                case 'action-plan':
                    endpoint = '/api/action-plan';
                    body = { goal: text };
                    break;
            }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                const data = await res.json();
                const assistantMessage: AIChatMessageData = {
                    role: 'assistant',
                    content: data.data?.response || data.data?.summary || data.data?.plan || JSON.stringify(data.data, null, 2),
                    timestamp: new Date().toISOString(),
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                throw new Error('Failed to get response');
            }
        } catch (error) {
            console.error('Error getting AI response:', error);
            const errorMessage: AIChatMessageData = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [user, activeFeature]);

    const getPlaceholder = () => {
        switch (activeFeature) {
            case 'recommend':
                return 'Describe your career goals to find matching mentors...';
            case 'summarize':
                return 'Describe your problem or challenge to summarize...';
            case 'action-plan':
                return 'What skill or goal do you want to achieve?';
            default:
                return 'Ask me anything about your career, skills, or learning path...';
        }
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" text="Loading AI Mentor..." />
            </div>
        );
    }

    const chatMessages = messages.map((msg, index) => ({
        id: `msg-${index}`,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.timestamp),
    }));

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col animate-fadeIn">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">AI Mentor</h1>
                        <p className="text-muted-foreground">
                            Powered by Google Gemini
                        </p>
                    </div>
                </div>
            </div>

            {/* Feature Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                        <button
                            key={feature.id}
                            onClick={() => setActiveFeature(feature.id)}
                            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeFeature === feature.id
                                ? 'bg-primary text-white'
                                : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {feature.name}
                        </button>
                    );
                })}
            </div>

            {/* Feature Description */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                {features.find(f => f.id === activeFeature)?.description}
            </div>

            {/* Chat */}
            <div className="flex-1 min-h-0 card">
                <ChatUI
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    placeholder={getPlaceholder()}
                    emptyMessage="Start a conversation with your AI mentor"
                />
            </div>
        </div>
    );
}
