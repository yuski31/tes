import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { LayoutGridIcon } from './icons/LayoutGridIcon';
import { MessageSquareIcon } from './icons/MessageSquareIcon';
import { ThemeToggle } from './ThemeToggle';

type View = 'blueprint' | 'playground';

interface HeaderProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onSettingsClick: () => void;
  currentView: View;
  onViewChange: (view: View) => void;
}

const ViewSwitcher: React.FC<{ currentView: View, onViewChange: (view: View) => void }> = ({ currentView, onViewChange }) => {
    const views: { id: View; name: string; icon: React.ReactNode }[] = [
        { id: 'blueprint', name: 'Blueprint', icon: <LayoutGridIcon className="w-5 h-5" /> },
        { id: 'playground', name: 'Playground', icon: <MessageSquareIcon className="w-5 h-5" /> },
    ];
    return (
        <div className="flex items-center p-1 rounded-full bg-slate-200 dark:bg-slate-800">
            {views.map(view => (
                <button
                    key={view.id}
                    onClick={() => onViewChange(view.id)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                        currentView === view.id
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                >
                    {view.icon}
                    {view.name}
                </button>
            ))}
        </div>
    );
};

export const Header: React.FC<HeaderProps> = ({ theme, setTheme, onSettingsClick, currentView, onViewChange }) => (
  <header className="text-center relative">
    <div className="absolute top-0 right-0 flex items-center gap-4">
        <button
            onClick={onSettingsClick}
            aria-label="Open API Settings"
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-950 transition-colors"
        >
            <SettingsIcon className="w-6 h-6" />
        </button>
        <ThemeToggle theme={theme} setTheme={setTheme} />
    </div>
    
    <div className="absolute top-0 left-0">
        <ViewSwitcher currentView={currentView} onViewChange={onViewChange} />
    </div>

    <div className="inline-flex items-center justify-center gap-3">
        <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full">
            <SparklesIcon className="w-8 h-8 text-indigo-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400">
          {currentView === 'blueprint' ? 'AI Company Blueprint Generator' : 'AI Playground'}
        </h1>
    </div>
    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
      {currentView === 'blueprint' 
          ? 'Transform your vision into a comprehensive business and tech plan. Just describe your AI company idea below.'
          : 'Experiment, test, and compare AI models in a real-time chat environment.'
      }
    </p>
  </header>
);
