import React from 'react';

export const MagicWandIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0m0 0a2.928 2.928 0 100-5.769 2.928 2.928 0 000 5.769zM10.5 19.5l-3 3m0 0l-3-3m3 3V17.5" />
    </svg>
);