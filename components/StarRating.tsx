'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    rating?: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
};

export default function StarRating({
    rating = 0,
    onRatingChange,
    readonly = false,
    size = 'md',
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const handleClick = (value: number) => {
        if (!readonly && onRatingChange) {
            onRatingChange(value);
        }
    };

    const handleMouseEnter = (value: number) => {
        if (!readonly) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        setHoverRating(0);
    };

    const displayRating = hoverRating || rating;

    return (
        <div className="flex items-center gap-1" onMouseLeave={handleMouseLeave}>
            {[1, 2, 3, 4, 5].map((value) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => handleClick(value)}
                    onMouseEnter={() => handleMouseEnter(value)}
                    disabled={readonly}
                    className={`transition-transform ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                        }`}
                >
                    <Star
                        className={`${sizeClasses[size]} ${value <= displayRating
                                ? 'star-filled fill-current'
                                : 'star-empty'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}
