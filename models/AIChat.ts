import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAIChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface IAIChat extends Document {
    userId: string;
    messages: IAIChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const AIChatMessageSchema = new Schema<IAIChatMessage>(
    {
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const AIChatSchema = new Schema<IAIChat>(
    {
        userId: {
            type: String,
            required: true,
        },
        messages: {
            type: [AIChatMessageSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Index for querying user's AI chat history
AIChatSchema.index({ userId: 1 });

const AIChat: Model<IAIChat> = mongoose.models.AIChat || mongoose.model<IAIChat>('AIChat', AIChatSchema);

export default AIChat;
