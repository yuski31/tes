import React from 'react';

export const MilestoneIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0l7-5.333L21 17v-4l-7-5.333L3 13V4m0 0v4" />
  </svg>
);
