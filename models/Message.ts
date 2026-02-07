import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
    senderId: string;
    receiverId: string;
    text: string;
    read: boolean;
    timestamp: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        senderId: {
            type: String,
            required: true,
        },
        receiverId: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
            maxlength: 2000,
        },
        read: {
            type: Boolean,
            default: false,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: false, // We use custom timestamp field
    }
);

// Index for querying messages between two users
MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ timestamp: -1 });

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
