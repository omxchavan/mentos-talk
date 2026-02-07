import Link from 'next/link';
import { Star } from 'lucide-react';
import { MentorCardData } from '@/types';
import { getInitials } from '@/lib/utils';

interface MentorCardProps {
    mentor: MentorCardData;
}

export default function MentorCard({ mentor }: MentorCardProps) {
    return (
        <Link href={`/mentor/${mentor.id}`}>
            <div className="card p-6 cursor-pointer group hover:border-primary/30">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    {mentor.profilePhoto ? (
                        <img
                            src={mentor.profilePhoto}
                            alt={mentor.name}
                            className="w-16 h-16 rounded-xl object-cover group-hover:scale-105 transition-transform"
                        />
                    ) : (
                        <div className="avatar w-16 h-16 text-xl rounded-xl group-hover:scale-105 transition-transform">
                            {getInitials(mentor.name)}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                            {mentor.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            {mentor.experience} years experience
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 star-filled fill-current" />
                            <span className="font-medium">{mentor.avgRating.toFixed(1)}</span>
                            <span className="text-muted-foreground text-sm">
                                ({mentor.totalRatings} reviews)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bio */}
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {mentor.bio}
                </p>

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-2">
                    {mentor.expertise.slice(0, 4).map((tag, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
                        >
                            {tag}
                        </span>
                    ))}
                    {mentor.expertise.length > 4 && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                            +{mentor.expertise.length - 4}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
