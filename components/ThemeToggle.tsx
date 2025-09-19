import React from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="relative inline-flex items-center h-8 w-14 rounded-full bg-slate-200 dark:bg-slate-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900"
    >
      <span
        className={`${
          theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
        } inline-flex items-center justify-center h-6 w-6 rounded-full bg-white dark:bg-slate-700 shadow-lg transform transition-transform duration-300`}
      >
        {theme === 'dark' ? <MoonIcon className="w-4 h-4 text-purple-400" /> : <SunIcon className="w-4 h-4 text-yellow-500" />}
      </span>
    </button>
  );
};
