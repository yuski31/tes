import React from 'react';

export const MagicWandIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c.828 0 1.5.672 1.5 1.5S12.828 14 12 14s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 13.5l3-3m5-5l3-3m-3 3l-3 3m3-3l3 3m-3-3V3m0 0v3m0 0H9m3 0h3m-3 0v3m0 0H9m3 0h3m-3-3l3-3m-3 3l-3 3m5 5l3 3m-3-3l-3-3m3 