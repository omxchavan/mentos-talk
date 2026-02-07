import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IReview extends Document {
    mentorId: Types.ObjectId;
    userId: Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        mentorId: {
            type: Schema.Types.ObjectId,
            ref: 'MentorProfile',
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            maxlength: 500,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure one review per user per mentor
ReviewSchema.index({ mentorId: 1, userId: 1 }, { unique: true });

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
