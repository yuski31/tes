import React, { useState, useEffect, useCallback } from 'react';
import { XIcon } from './icons/XIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { fetchOpenRouterModels } from '../services/geminiService';
import { Loader } from './Loader';

export interface ApiConfig {
    provider: string;
    apiKey: string;
    baseUrl: string;
    model: string;
}

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: ApiConfig) => void;
    currentConfig: ApiConfig;
}

// Basic debounce hook
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentConfig }) => {
    const [config, setConfig] = useState<ApiConfig>(currentConfig);
    const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
    const [apiKeyError, setApiKeyError] = useState<string | null>(null);

    const [models, setModels] = useState<string[]>([]);
    const [isFetchingModels, setIsFetchingModels] = useState(false);
    
    const debouncedApiKey = useDebounce(config.apiKey, 500);

    useEffect(() => {
        setConfig(currentConfig);
    }, [currentConfig, isOpen]);

    useEffect(() => {
        const getModels = async () => {
            if (!debouncedApiKey || debouncedApiKey.length < 30) {
                 const defaultModels = await fetchOpenRouterModels('');
                 setModels(defaultModels);
                 setIsFetchingModels(false);
                 return;
            }
            setIsFetchingModels(true);
            const fetchedModels = await fetchOpenRouterModels(debouncedApiKey);
            setModels(fetchedModels);
            // If the current model is not in the new list, update it to the first available one
            if (!fetchedModels.includes(config.model)) {
                setConfig(prev => ({ ...prev, model: fetchedModels[0] || '' }));
            }
            setIsFetchingModels(false);
        };
        if(isOpen) {
             getModels();
        }
    }, [debouncedApiKey, isOpen]);
    
    if (!isOpen) {
        return null;
    }

    const validateAndSave = () => {
        if (config.apiKey.trim().length < 30) {
            setApiKeyError('API key is required and should be at least 30 characters long.');
            return;
        }
        setApiKeyError(null);
        onSave(config);
        onClose();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'apiKey') {
            if (apiKeyError) setApiKeyError(null);
        }
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center animate-fade-in-up"
            style={{ animationDuration: '0.3s' }}
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md m-4 p-6 border border-slate-200 dark:border-slate-700"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">API Settings</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <XIcon className="w-6 h-6"/>
                    </button>
                </div>
                
                <div className="space-y-4">
                     <div>
                        <label htmlFor="provider" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                          Provider Name
                        </label>
                        <input
                          id="provider"
                          name="provider"
                          type="text"
                          value={config.provider}
                          onChange={handleInputChange}
                          placeholder="e.g., OpenRouter"
                          className="w-full p-2 bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                    </div>
                     <div>
                        <label htmlFor="baseUrl" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                          Base URL
                        </label>
                        <input
                          id="baseUrl"
                          name="baseUrl"
                          type="text"
                          value={config.baseUrl}
                          onChange={handleInputChange}
                          placeholder="e.g., https://openrouter.ai/api/v1"
                          className="w-full p-2 bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                          API Key
                        </label>
                        <div className="relative">
                             <input
                              id="apiKey"
                              name="apiKey"
                              type={isApiKeyVisible ? 'text' : 'password'}
                              value={config.apiKey}
                              onChange={handleInputChange}
                              placeholder="Enter your API key"
                              autoComplete="new-password"
                              className={`w-full p-2 pr-10 bg-slate-100 dark:bg-slate-700/50 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${apiKeyError ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                            />
                            <button
                                type="button"
                                onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                aria-label={isApiKeyVisible ? "Hide API key" : "Show API key"}
                            >
                                {isApiKeyVisible ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                            </button>
                        </div>
                        {apiKeyError && <p className="text-sm text-red-500 mt-1">{apiKeyError}</p>}
                    </div>
                     <div>
                        <label htmlFor="model" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                          Model Name
                        </label>
                        <div className="relative">
                            <select
                                id="model"
                                name="model"
                                value={config.model}
                                onChange={handleInputChange}
                                disabled={isFetchingModels || models.length === 0}
                                className="w-full p-2 bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none"
                            >
                                {models.map(modelName => (
                                    <option key={modelName} value={modelName}>{modelName}</option>
                                ))}
                            </select>
                            {isFetchingModels && <div className="absolute inset-y-0 right-3 flex items-center"><Loader /></div>}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={validateAndSave}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};