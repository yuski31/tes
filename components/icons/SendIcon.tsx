import React from 'react';

export const SendIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.32M6 12h7.32M9 19.235l-4.35-4.35c-.58-.58-.58-1.52 0-2.1l4.35-4.35a1.031 1.031 0 011.46 1.46l-4.35 4.35a1.031 1.031 0 001.46 1.46l4.35-4.35a1.031 1.031 0 011.46 0 1.031 1.031 0 010 1.46l-4.35 4.35a1.031 1.031 0 01-1.46 0l-4.35-4.35a1.031 1.031 0 010-1.46z" />
    </svg>
);