import React from 'react';

interface PromptInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({ value, onChange }) => (
  <div>
    <label htmlFor="company-idea" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
      Your AI Company Idea
    </label>
    <textarea
      id="company-idea"
      value={value}
      onChange={onChange}
      rows={8}
      placeholder="e.g., An AI company that provides API access to various models and has an advanced AI chat playground..."
      className="w-full p-4 bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700/50 rounded-lg shadow-inner focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
    />
  </div>
);