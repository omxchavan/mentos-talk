'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { MessageSquare, Search } from 'lucide-react';
import { LoadingSpinner } from '@/components';
import { ConversationPreview } from '@/types';
import { getInitials, formatRelativeTime } from '@/lib/utils';

export default function MessagesPage() {
    const { user } = useUser();
    const [conversations, setConversations] = useState<ConversationPreview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchConversations = async () => {
            if (!user) return;

            try {
                const res = await fetch('/api/messages/conversations');
                if (res.ok) {
                    const data = await res.json();
                    setConversations(data.data || []);
                }
            } catch (error) {
                console.error('Error fetching conversations:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();
    }, [user]);

    const filteredConversations = conversations.filter(conv =>
        conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" text="Loading messages..." />
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Messages</h1>
                <p className="text-muted-foreground">
                    Your conversations with mentors
                </p>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-12"
                />
            </div>

            {/* Conversations List */}
            {filteredConversations.length > 0 ? (
                <div className="space-y-2">
                    {filteredConversations.map((conv) => (
                        <Link key={conv.id} href={`/chat/${conv.participantId}`}>
                            <div className="card p-4 flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer">
                                {conv.participantPhoto ? (
                                    <img
                                        src={conv.participantPhoto}
                                        alt={conv.participantName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="avatar w-12 h-12 text-sm">
                                        {getInitials(conv.participantName)}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-medium truncate">{conv.participantName}</h3>
                                        <span className="text-xs text-muted-foreground flex-shrink-0">
                                            {formatRelativeTime(new Date(conv.lastMessageTime))}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {conv.lastMessage}
                                    </p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <span className="w-6 h-6 rounded-full bg-primary text-black text-xs flex items-center justify-center flex-shrink-0">
                                        {conv.unreadCount}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="card p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No messages yet</h3>
                    <p className="text-muted-foreground mb-4">
                        Start a conversation with a mentor
                    </p>
                    <Link href="/mentors" className="btn-primary">
                        Find Mentors
                    </Link>
                </div>
            )}
        </div>
    );
}
