
import React from 'react';

interface LeadScoreBadgeProps {
    score: number;
    size?: number;
}

const LeadScoreBadge: React.FC<LeadScoreBadgeProps> = ({ score, size = 60 }) => {
    const radius = (size - 10) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (s >= 75) return '#25D366'; // High
        if (s >= 50) return '#facc15'; // Medium
        return '#f87171'; // Low
    };

    const getLabel = (s: number) => {
        if (s >= 75) return 'High Potential';
        if (s >= 50) return 'Medium';
        return 'Low';
    };

    const color = getColor(score);

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="w-full h-full -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke="#f3f4f6"
                        strokeWidth="5"
                    />
                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke={color}
                        strokeWidth="5"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-gray-900">
                    {score}
                </div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>
                {getLabel(score)}
            </span>
        </div>
    );
};

export default LeadScoreBadge;
