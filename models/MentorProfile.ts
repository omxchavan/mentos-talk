import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IMentorProfile extends Document {
    userId: Types.ObjectId;
    bio: string;
    expertise: string[];
    experience: number;
    availability: string;
    profilePhoto?: string;
    avgRating: number;
    totalRatings: number;
    totalSessions: number;
    createdAt: Date;
    updatedAt: Date;
}

const MentorProfileSchema = new Schema<IMentorProfile>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        bio: {
            type: String,
            required: true,
            maxlength: 1000,
        },
        expertise: {
            type: [String],
            required: true,
            default: [],
        },
        experience: {
            type: Number,
            required: true,
            min: 0,
        },
        availability: {
            type: String,
            required: true,
        },
        profilePhoto: {
            type: String,
        },
        avgRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalRatings: {
            type: Number,
            default: 0,
        },
        totalSessions: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Index for searching mentors by expertise
MentorProfileSchema.index({ expertise: 1 });
MentorProfileSchema.index({ avgRating: -1 });

const MentorProfile: Model<IMentorProfile> =
    mongoose.models.MentorProfile || mongoose.model<IMentorProfile>('MentorProfile', MentorProfileSchema);

export default MentorProfile;
