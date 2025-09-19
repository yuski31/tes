import React, { useState, useEffect, useRef } from 'react';
import { ApiConfig } from './SettingsModal';
import { ChatMessage } from '../types';
import { fetchOpenRouterModels } from '../services/geminiService';
import { Loader } from './Loader';
import { SendIcon } from './icons/SendIcon';
import { TrashIcon } from './icons/TrashIcon';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';

// A simple markdown-to-HTML converter
const parseMarkdown = (text: string) => {
    // Escape HTML to prevent XSS
    let escapedText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Process code blocks
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    escapedText = escapedText.replace(codeBlockRegex, (match, lang, code) => {
        return `<pre><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>`;
    });

    // Process inline code
    const inlineCodeRegex = /`([^`]+)`/g;
    escapedText = escapedText.replace(inlineCodeRegex, '<code>$1</code>');
    
    // Process bold text
    const boldRegex = /\*\*([^\*]+)\*\*/g;
    escapedText = escapedText.replace(boldRegex, '<strong>$1</strong>');

    return { __html: escapedText.replace(/\n/g, '<br />') };
};

interface PlaygroundProps {
    apiConfig: ApiConfig;
    messages: ChatMessage[];
    onSendMessage: (message: string, selectedModels: string[]) => void;
    isLoading: boolean;
    error: string | null;
    onClearChat: () => void;
}

type ChatMode = 'single' | 'multi';

const ChatMessageDisplay: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    
    return (
        <div className={`flex items-start gap-4 my-4 ${isUser ? 'justify-end' : ''}`}>
             {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <BotIcon className="w-5 h-5 text-indigo-400" />
                </div>
            )}
            <div className={`max-w-xl p-4 rounded-xl shadow-md ${isUser ? 'bg-sky-500 text-white' : 'bg-white dark:bg-slate-800'}`}>
                {!isUser && <p className="text-xs font-bold text-indigo-400 mb-2">{message.model}</p>}
                <div 
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={parseMarkdown(message.content)}
                />
            </div>
             {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-slate-500" />
                </div>
            )}
        </div>
    );
};


export const Playground: React.FC<PlaygroundProps> = ({ apiConfig, messages, onSendMessage, isLoading, error, onClearChat }) => {
    const [chatMode, setChatMode] = useState<ChatMode>('single');
    const [newMessage, setNewMessage] = useState('');
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [selectedModels, setSelectedModels] = useState<string[]>([apiConfig.model]);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getModels = async () => {
            const models = await fetchOpenRouterModels(apiConfig.apiKey);
            setAvailableModels(models);
        };
        getModels();
    }, [apiConfig.apiKey]);

    useEffect(() => {
        if (chatMode === 'single' && apiConfig.model) {
            setSelectedModels([apiConfig.model]);
        }
    }, [chatMode, apiConfig.model]);
    
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        onSendMessage(newMessage, selectedModels);
        setNewMessage('');
    };
    
    const handleModelSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (chatMode === 'single') {
            setSelectedModels([e.target.value]);
        } else {
            const options = Array.from(e.target.selectedOptions, option => option.value);
            setSelectedModels(options);
        }
    };

    const userMessages = messages.filter(m => m.role === 'user');
    const assistantResponses = messages.filter(m => m.role === 'assistant');

    return (
        <div className="mt-8 max-w-6xl mx-auto flex flex-col h-[75vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-indigo-950/20 animate-fade-in-up">
            <header className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded-full bg-slate-200 dark:bg-slate-800/50">
                        <button onClick={() => setChatMode('single')} className={`px-3 py-1 text-sm font-semibold rounded-full ${chatMode === 'single' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}>Single Chat</button>
                        <button onClick={() => setChatMode('multi')} className={`px-3 py-1 text-sm font-semibold rounded-full ${chatMode === 'multi' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}>Multi-Model</button>
                    </div>
                </div>
                <div className="flex-grow min-w-[200px] max-w-md">
                   <select
                        value={chatMode === 'single' ? selectedModels[0] : selectedModels}
                        onChange={handleModelSelection}
                        multiple={chatMode === 'multi'}
                        className="w-full text-sm p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500"
                        size={chatMode === 'multi' ? 4 : 1}
                    >
                        {availableModels.map(model => <option key={model} value={model}>{model}</option>)}
                   </select>
                   {chatMode === 'multi' && <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple models.</p>}
                </div>
                <button
                    onClick={onClearChat}
                    className="p-2 text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    aria-label="Clear chat history"
                >
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </header>
            
            <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-6">
                {messages.length === 0 && (
                    <div className="text-center text-slate-500">
                        <p>Start a conversation with the AI.</p>
                        <p className="text-sm">Select a mode and model above.</p>
                    </div>
                )}
                 {chatMode === 'single' && messages.map(msg => <ChatMessageDisplay key={msg.id} message={msg} />)}
                 {chatMode === 'multi' && userMessages.map((userMsg, index) => (
                    <div key={userMsg.id}>
                        <ChatMessageDisplay message={userMsg} />
                        <div className={`grid grid-cols-1 md:grid-cols-${selectedModels.length} gap-4`}>
                             {assistantResponses
                                .slice(index * selectedModels.length, (index + 1) * selectedModels.length)
                                .map(resp => <ChatMessageDisplay key={resp.id} message={resp} />)
                            }
                        </div>
                         {index < userMessages.length - 1 && <hr className="my-8 border-slate-200 dark:border-slate-700" />}
                    </div>
                 ))}
                 {isLoading && messages.length > 0 && <div className="flex justify-center mt-4"><Loader/></div>}
                 {error && <p className="text-center text-red-500 text-sm p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">{error}</p>}
            </main>

            <footer className="p-4 border-t border-slate-200 dark:border-slate-800">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                             if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        placeholder="Type your message here..."
                        rows={1}
                        className="w-full p-3 bg-slate-100 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-lg shadow-inner focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !newMessage.trim() || selectedModels.length === 0}
                        className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-all disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        <SendIcon className="w-6 h-6"/>
                    </button>
                </form>
            </footer>
        </div>
    );
};
