import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { SettingsModal, ApiConfig } from './components/SettingsModal';
import { BlueprintDisplay } from './components/BlueprintDisplay';
import { Playground } from './components/Playground';
import { Loader } from './components/Loader';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { MagicWandIcon } from './components/icons/MagicWandIcon';
import type { Blueprint, ChatMessage } from './types';
import { generateCompanyBlueprint, generateLogo, enhancePrompt, streamChatCompletion } from './services/geminiService';

type Theme = 'light' | 'dark';
type View = 'blueprint' | 'playground';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>(`I want you to make A Detailed Plan Blueprint architech and Features functions logics to build an AI company name Shin and about this company this Company is an AI company who provide services like API keys and AI chat section/playground where we can add AI models through custom provider custom settings like Provider name Base url and api keys and models name who give calls in playground there should good UI and Ux where we can chat and create a new section and compare 5 AI i mean AI chat section at same time whenever we send prompt every ai should reply this should in option one is single AI and another is multi AI where we can chat and this AI service provide AI build full stack website Fullstack website in there technology should be like this`);
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
      provider: 'OpenRouter',
      apiKey: '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',
      baseUrl: 'https://openrouter.ai/api/v1',
      model: 'openrouter/sonoma-sky-alpha'
  });
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isBlueprintLoading, setIsBlueprintLoading] = useState<boolean>(false);
  const [isLogoLoading, setIsLogoLoading] = useState<boolean>(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('blueprint');

  // Playground State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleEnhancePrompt = async () => {
    setError(null);
    if (!userInput.trim()) {
        setError('Please enter an idea before enhancing the prompt.');
        return;
    }
    if (!apiConfig.apiKey.trim()) {
        setError('Please configure your API key in the Settings panel before enhancing the prompt.');
        return;
    }
    
    setIsEnhancingPrompt(true);
    try {
        const enhanced = await enhancePrompt(userInput, apiConfig);
        setUserInput(enhanced);
    } catch (err) {
        console.error(err);
        let errorMessage = 'An unexpected error occurred while enhancing the prompt. Please try again.';
         if (err instanceof Error) {
            if (err.message.includes('Invalid API Key')) {
                errorMessage = 'Invalid API Key: The API key you provided is incorrect. Please check your settings and try again.';
            } else if (err.message.includes('Quota Exceeded')) {
                errorMessage = 'API Quota Exceeded: You have reached your request limit. Please check your plan and billing details with your provider.';
            } else {
                 errorMessage = `AI Service Error: The AI model couldn't process your request. Please check your settings or try again later.`;
            }
        }
        setError(errorMessage);
    } finally {
        setIsEnhancingPrompt(false);
    }
  };

  const handleGenerateBlueprint = async () => {
    setError(null);
    if (!userInput.trim()) {
      setError('Please describe your company idea before generating a blueprint.');
      return;
    }
     if (!apiConfig.apiKey.trim()) {
      setError('Please configure your API key in the Settings panel before generating a blueprint.');
      return;
    }
    
    setIsBlueprintLoading(true);
    setIsLogoLoading(true);
    setBlueprint(null);
    setLogoUrl(null);

    const blueprintTask = generateCompanyBlueprint(userInput, apiConfig);
    const logoTask = generateLogo('Shin');

    blueprintTask
      .then(setBlueprint)
      .catch(err => {
        console.error(err);
        let errorMessage = 'An unexpected error occurred while generating the blueprint. Please try again.';
        if (err instanceof Error) {
            if (err.message.includes('Invalid API Key')) {
                errorMessage = 'Invalid API Key: The API key you provided is incorrect. Please check your settings and try again.';
            } else if (err.message.includes('Quota Exceeded')) {
                errorMessage = 'API Quota Exceeded: You have reached your request limit. Please check your plan and billing details with your provider.';
            } else if (err.message.includes('Network Error')) {
                errorMessage = 'Network Error: We couldn\'t connect to the AI service. Please check your internet connection and API settings.';
            } else if (err.message.includes('invalid response format')) {
                errorMessage = 'Invalid AI Response: The service returned data in an unexpected format. This might be a temporary issue. Try modifying your prompt or checking your model settings.';
            } else if (err.message.includes('AI Service Error')) {
                errorMessage = `AI Service Error: The AI model couldn't process your request. Please check your settings (Base URL, Model Name) or try again later.`;
            }
        }
        setError(errorMessage);
        setBlueprint(null);
      })
      .finally(() => {
        setIsBlueprintLoading(false);
      });
    
    logoTask
        .then(setLogoUrl)
        .catch(err => {
            console.error("Logo generation failed:", err);
        })
        .finally(() => {
            setIsLogoLoading(false);
        });
  };

  const handleSendChatMessage = useCallback(async (message: string, selectedModels: string[]) => {
      if (!message.trim() || selectedModels.length === 0) return;
      if (!apiConfig.apiKey.trim()) {
          setChatError('Please configure your API key in the Settings panel before starting a chat.');
          return;
      }

      setChatError(null);
      setIsChatLoading(true);

      const userMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: message,
          model: 'user',
      };
      
      const newMessages = [...chatMessages, userMessage];
      setChatMessages(newMessages);
      
      const assistantMessagePlaceholders = selectedModels.map((model, index) => ({
          id: `${Date.now()}-${model}-${index}`,
          role: 'assistant' as const,
          content: '',
          model: model
      }));
      
      setChatMessages(prev => [...prev, ...assistantMessagePlaceholders]);

      try {
          const promises = selectedModels.map(async (model, index) => {
              const placeholderId = assistantMessagePlaceholders[index].id;
              const history = newMessages.filter(m => m.role !== 'assistant' || m.model === model);
              
              const stream = streamChatCompletion(history, { ...apiConfig, model });

              for await (const chunk of stream) {
                  setChatMessages(prev =>
                      prev.map(msg =>
                          msg.id === placeholderId ? { ...msg, content: msg.content + chunk } : msg
                      )
                  );
              }
          });

          await Promise.all(promises);

      } catch (err: any) {
          console.error("Chat failed:", err);
          let errorMessage = `An error occurred while communicating with the AI. Please check your settings.`;
           if (err.message.includes('Invalid API Key')) {
              errorMessage = 'Invalid API Key: Please check your settings and try again.';
          } else if (err.message.includes('Quota Exceeded')) {
              errorMessage = 'API Quota Exceeded: You have reached your request limit with your provider.';
          }
          setChatError(errorMessage);
          setChatMessages(newMessages); // Revert to only user message on error
      } finally {
          setIsChatLoading(false);
      }
  }, [apiConfig, chatMessages]);

  const isLoading = isBlueprintLoading || isEnhancingPrompt;

  const renderBlueprintView = () => (
    <>
      <div className="max-w-4xl mx-auto mt-8">
        <PromptInput value={userInput} onChange={(e) => setUserInput(e.target.value)} />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleEnhancePrompt}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-lg shadow-md hover:bg-slate-300 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-all duration-300 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 active:scale-100"
            >
              {isEnhancingPrompt ? (
                <>
                  <Loader />
                  Enhancing...
                </>
              ) : (
                <>
                  <MagicWandIcon />
                  Enhance Prompt
                </>
              )}
            </button>
            <button
              onClick={handleGenerateBlueprint}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-all duration-300 disabled:from-sky-400 disabled:to-indigo-500 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 active:scale-100"
            >
              {isBlueprintLoading ? (
                <>
                  <Loader />
                  Generating Blueprint...
                </>
              ) : (
                <>
                  <SparklesIcon />
                  Generate Blueprint
                </>
              )}
            </button>
        </div>
      </div>
      
      <div className="mt-12">
        {error && (
          <div className="max-w-4xl mx-auto p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700/50 text-red-700 dark:text-red-300 rounded-lg text-center">
            <p className="font-semibold">Operation Failed</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
        {blueprint && <BlueprintDisplay blueprint={blueprint} logoUrl={logoUrl} isLogoLoading={isLogoLoading} />}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans relative transition-colors duration-300">
      <div className="aurora-background"></div>
      <main className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        <Header 
            theme={theme} 
            setTheme={setTheme} 
            onSettingsClick={() => setIsSettingsModalOpen(true)}
            currentView={currentView}
            onViewChange={setCurrentView}
        />
        {currentView === 'blueprint' ? renderBlueprintView() : (
            <Playground
                apiConfig={apiConfig}
                messages={chatMessages}
                onSendMessage={handleSendChatMessage}
                isLoading={isChatLoading}
                error={chatError}
                onClearChat={() => {
                    setChatMessages([]);
                    setChatError(null);
                }}
            />
        )}
      </main>
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={setApiConfig}
        currentConfig={apiConfig}
      />
    </div>
  );
};

export default App;
