'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { pusherClient } from '@/lib/pusher-client';
import { useUser } from '@clerk/nextjs';

interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    text: string;
    timestamp: string;
    read: boolean;
}

interface RealtimeChatProps {
    partnerId: string;
    partnerName: string;
}

export default function RealtimeChat({ partnerId, partnerName }: RealtimeChatProps) {
    const { user } = useUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Fetch initial messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(`/api/messages?partnerId=${partnerId}`);
                const result = await response.json();
                if (result.success) {
                    setMessages(result.data);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setIsFetching(false);
            }
        };

        fetchMessages();
    }, [partnerId]);

    // Subscribe to Pusher channel for real-time updates
    useEffect(() => {
        if (!user?.id) return;

        // Create consistent channel ID (sorted user IDs)
        const channelId = [user.id, partnerId].sort().join('-');
        const channel = pusherClient.subscribe(`private-chat-${channelId}`);

        channel.bind('new-message', (data: Message) => {
            setMessages((prev) => {
                // Avoid duplicates
                if (prev.some((msg) => msg.id === data.id)) {
                    return prev;
                }
                return [...prev, data];
            });
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [user?.id, partnerId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
        }
    }, [input]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !user?.id) return;

        const messageText = input.trim();
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: partnerId,
                    text: messageText,
                }),
            });

            const result = await response.json();
            if (result.success) {
                // Message will be added via Pusher event
                // But add optimistically in case of delay
                setMessages((prev) => {
                    if (prev.some((msg) => msg.id === result.data.id)) {
                        return prev;
                    }
                    return [...prev, result.data];
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Re-add the message to input on error
            setInput(messageText);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                <Send className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-muted-foreground">
                                Start chatting with {partnerName}
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isCurrentUser = message.senderId === user?.id;
                        return (
                            <div
                                key={message.id}
                                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-3 ${isCurrentUser
                                            ? 'chat-bubble-user'
                                            : 'chat-bubble-other'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap break-words">
                                        {message.text}
                                    </p>
                                    <p
                                        className={`text-xs mt-1 ${isCurrentUser
                                                ? 'text-white/70'
                                                : 'text-muted-foreground'
                                            }`}
                                    >
                                        {formatRelativeTime(new Date(message.timestamp))}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex justify-start animate-fadeIn">
                        <div className="chat-bubble-other px-4 py-3">
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-muted-foreground">Sending...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-4">
                <form onSubmit={handleSubmit} className="flex items-end gap-3">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Message ${partnerName}...`}
                            rows={1}
                            className="input resize-none pr-12 min-h-[48px] max-h-[150px]"
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="btn-primary p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </form>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
