// Type definitions for the application

export type UserRole = 'mentor' | 'mentee';

export interface UserProfile {
    id: string;
    clerkId: string;
    name: string;
    email: string;
    role: UserRole;
    profilePhoto?: string;
}

export interface MentorCardData {
    id: string;
    name: string;
    profilePhoto?: string;
    bio: string;
    expertise: string[];
    experience: number;
    avgRating: number;
    totalRatings: number;
}

export interface MentorDetailData extends MentorCardData {
    availability: string;
    userId: string;
    totalSessions: number;
}

export interface ReviewData {
    id: string;
    userId: string;
    userName: string;
    userPhoto?: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface MessageData {
    id: string;
    senderId: string;
    receiverId: string;
    text: string;
    timestamp: string;
    read: boolean;
}

export interface ConversationPreview {
    id: string;
    participantId: string;
    participantName: string;
    participantPhoto?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

export interface AIChatMessageData {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export interface AIRecommendation {
    mentor: MentorCardData;
    matchScore: number;
    matchReason: string;
}

export interface ActionPlan {
    steps: string[];
    resources: string[];
    timeline: string;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Socket Events
export interface SocketEvents {
    'send-message': (message: { receiverId: string; text: string }) => void;
    'receive-message': (message: MessageData) => void;
    'user-online': (userId: string) => void;
    'user-offline': (userId: string) => void;
    'typing': (data: { senderId: string; receiverId: string }) => void;
    'stop-typing': (data: { senderId: string; receiverId: string }) => void;
}
