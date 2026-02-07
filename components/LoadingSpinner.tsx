'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    fullScreen?: boolean;
}

const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
};

export default function LoadingSpinner({
    size = 'md',
    text,
    fullScreen = false,
}: LoadingSpinnerProps) {
    const content = (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative">
                <Loader2
                    className={`${sizeClasses[size]} text-primary`}
                    style={{
                        animation: 'spin 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite'
                    }}
                />
            </div>
            {text && <p className="text-muted-foreground text-sm font-medium">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background/90 backdrop-blur-md z-50 animate-fadeIn">
                {content}
            </div>
        );
    }

    return content;
}
