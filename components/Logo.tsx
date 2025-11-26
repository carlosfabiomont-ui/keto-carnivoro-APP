import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        className={className}
        viewBox="0 0 100 50"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="48"
            fontWeight="bold"
            fontFamily="sans-serif"
        >
            KC
        </text>
    </svg>
);