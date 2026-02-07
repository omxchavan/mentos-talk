'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ChatUI, LoadingSpinner } from '@/components';
import { MessageData } from '@/types';
import { getInitials } from '@/lib/utils';

interface ChatPartner {
    id: string;
    name: string;
    profilePhoto?: string;
}

export default function ChatPage() {
    const params = useParams();
    const { user } = useUser();
    const partnerId = params.userId as string;

    const [messages, setMessages] = useState<MessageData[]>([]);
    const [partner, setPartner] = useState<ChatPartner | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    // Fetch chat data
    useEffect(() => {
        const fetchChatData = async () => {
            if (!user) return;

            try {
                // Fetch messages
                const messagesRes = await fetch(`/api/messages?partnerId=${partnerId}`);
                if (messagesRes.ok) {
                    const messagesData = await messagesRes.json();
                    setMessages(messagesData.data || []);
                }

                // Fetch partner info
                const partnerRes = await fetch(`/api/users/${partnerId}`);
                if (partnerRes.ok) {
                    const partnerData = await partnerRes.json();
                    setPartner(partnerData.data);
                }
            } catch (error) {
                console.error('Error fetching chat data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChatData();

        // Poll for new messages every 3 seconds
        const interval = setInterval(fetchChatData, 3000);
        return () => clearInterval(interval);
    }, [user, partnerId]);

    const handleSendMessage = useCallback(async (text: string) => {
        if (!user) return;

        setIsSending(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: partnerId,
                    text,
                }),
            });

            if (res.ok) {
                const newMessage = await res.json();
                setMessages(prev => [...prev, newMessage.data]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    }, [user, partnerId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" text="Loading chat..." />
            </div>
        );
    }

    const chatMessages = messages.map(msg => ({
        id: msg.id,
        role: (msg.senderId === user?.id ? 'user' : 'other') as 'user' | 'assistant' | 'other',
        content: msg.text,
        timestamp: new Date(msg.timestamp),
    }));

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-border mb-4">
                <Link
                    href="/messages"
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                {partner?.profilePhoto ? (
                    <img
                        src={partner.profilePhoto}
                        alt={partner.name}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="avatar w-10 h-10 text-sm">
                        {getInitials(partner?.name || 'User')}
                    </div>
                )}
                <div>
                    <h2 className="font-semibold">{partner?.name || 'User'}</h2>
                    <p className="text-sm text-muted-foreground">Active now</p>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 min-h-0">
                <ChatUI
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    isLoading={isSending}
                    placeholder="Type a message..."
                    emptyMessage="Start your conversation"
                />
            </div>
        </div>
    );
}
