import { ReviewData } from '@/types';
import StarRating from './StarRating';
import { getInitials, formatRelativeTime } from '@/lib/utils';

interface ReviewCardProps {
    review: ReviewData;
}

export default function ReviewCard({ review }: ReviewCardProps) {
    return (
        <div className="card p-4">
            <div className="flex items-start gap-3">
                {/* User Avatar */}
                {review.userPhoto ? (
                    <img
                        src={review.userPhoto}
                        alt={review.userName}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="avatar w-10 h-10 text-sm">
                        {getInitials(review.userName)}
                    </div>
                )}

                {/* Review Content */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <div>
                            <h4 className="font-medium">{review.userName}</h4>
                            <StarRating rating={review.rating} readonly size="sm" />
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(new Date(review.createdAt))}
                        </span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-2">{review.comment}</p>
                </div>
            </div>
        </div>
    );
}
