import React from 'react';

export const LayoutGridIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 5a1 1 0 011-1h16a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V5zm3 0v10m8-10v10" />
    </svg>
);