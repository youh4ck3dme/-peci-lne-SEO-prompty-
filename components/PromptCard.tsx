import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Prompt } from '../types';
import { PromptType } from '../types';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import CodeBlock from './CodeBlock';

interface PromptCardProps {
  prompt: Prompt;
  onCopy: (message?: string) => void;
  isNew: boolean;
  onMarkAsSeen: () => void;
  initialResponse: string;
  onResponseUpdate: (response: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onCopy, isNew, onMarkAsSeen, initialResponse, onResponseUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(!!initialResponse);
  const [isSuccess, setIsSuccess] = useState(false);
  const [placeholderValues, setPlaceholderValues] = useState<{ [key: string]: string }>({});
  const [showInputs, setShowInputs] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState<string>(initialResponse);
  const [error, setError] = useState<string | null>(null);
  const isStreaming = useRef(false);
  const { settings } = useSettings();
  const { language, t } = useLanguage();

  const placeholders = useMemo(() => {
    const matches = prompt.content.match(/{{\s*(\w+)\s*}}/g);
    if (!matches) return [];
    return [...new Set(matches.map(p => p.replace(/{{|}}/g, '').trim()))];
  }, [prompt.content]);

  useEffect(() => {
      const initialValues: { [key: string]: string } = {};
      placeholders.forEach(p => {
          if (settings[p]) {
              initialValues[p] = settings[p];
          }
      });
      setPlaceholderValues(prev => ({...initialValues, ...prev}));
  }, [settings, placeholders]);

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => {
        onMarkAsSeen();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isNew, onMarkAsSeen]);

  useEffect(() => {
    onResponseUpdate(geminiResponse);
  }, [geminiResponse, onResponseUpdate]);
  
  const processedContent = useMemo(() => {
    return placeholders.reduce((acc, placeholder) => {
      const value = placeholderValues[placeholder];
      const replacement = value ? value : `{{${placeholder}}}`;
      return acc.replace(new RegExp(`{{\\s*${placeholder}\\s*}}`, 'g'), replacement);
    }, prompt.content);
  }, [prompt.content, placeholders, placeholderValues]);
  
  const hasPlaceholders = useMemo(() => /{{\s*\w+\s*}}/.test(processedContent), [processedContent]);

  const handleCopy = async (textToCopy: string, messageKey: keyof ReturnType<typeof t> | string) => {
    try {
      await navigator.clipboard.writeText(textToCopy.trim());
      onCopy(t(messageKey as any));
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 900);
    } catch (e) {
      console.error('Failed to copy text: ', e);
      onCopy(t("toast.copyError"));
    }
  };

  const handleClearResponse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGeminiResponse('');
    setError(null);
    setIsLoading(false);
    isStreaming.current = false;
  };
  
  const handleRunPrompt = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasPlaceholders) {
        onCopy(t("promptCard.fillVariablesWarning"));
        setShowInputs(true);
        return;
      }
      if (isStreaming.current || isLoading) return;

      setIsLoading(true);
      setGeminiResponse('');
      setError(null);
      isStreaming.current = true;
      
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: processedContent,
        });
        
        if (!isExpanded) setIsExpanded(true);
        
        let fullResponse = '';
        for await (const chunk of responseStream) {
          if (!isStreaming.current) {
            console.log("Streaming cancelled by user.");
            break;
          }
          fullResponse += chunk.text;
          setGeminiResponse(fullResponse);
        }
      } catch (err) {
        console.error("Gemini API error:", err);
        setError(t("promptCard.error"));
      } finally {
        setIsLoading(false);
        isStreaming.current = false;
      }
    };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input, a, .interactive-area')) {
      return;
    }
    handleCopy(processedContent, "toast.promptCopied");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCopy(processedContent, "toast.promptCopied");
    } else if (e.key.toLowerCase() === 'e') {
      setIsExpanded(prev => !prev);
    }
  };

  const handleValueChange = (placeholder: string, value: string) => {
    setPlaceholderValues(prev => ({ ...prev, [placeholder]: value }));
  };
  
  const showResponseArea = isLoading || error || geminiResponse;
  const cardTitle = prompt.title[language];

  const cardClasses = [
    'relative isolate bg-white/[.12] backdrop-blur-xl border border-white/[.18]',
    'rounded-2xl md:rounded-3xl p-4 sm:p-5',
    'transition-all duration-300 ease-[cubic-bezier(.175,.885,.32,1.275)]',
    'cursor-pointer overflow-hidden shadow-lg shadow-black/20',
    'hover:-translate-y-1 hover:scale-[1.015] hover:bg-white/[.18]',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-opacity-75',
    prompt.type === PromptType.Urgent && !isSuccess ? 'bg-red-500/[.10] border-red-500/[.24]' : '',
    isSuccess ? 'bg-green-500/[.15] border-green-500/[.28]' : '',
    prompt.type === PromptType.Success && !isSuccess ? 'bg-green-500/[.10] border-green-500/[.24]' : '',
    isNew ? 'animate-pulse-glow' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClasses}
      onClick={handleCardClick}
      onDoubleClick={() => setIsExpanded(prev => !prev)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={t('promptCard.copyAriaLabel', { title: cardTitle })}
    >
      <div className="absolute inset-[-1px] rounded-[23px] md:rounded-[25px] bg-gradient-to-br from-white/20 via-white/5 to-white/10 blur-sm -z-10 opacity-75 pointer-events-none"></div>
      
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 shadow-md flex items-center justify-center text-xl">
          {prompt.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline gap-2 mb-2">
            <h3 className="text-base sm:text-lg font-bold text-white truncate pr-32">{cardTitle}</h3>
            <span className="text-xs text-white/75 font-medium flex-shrink-0">{prompt.timestamp[language]}</span>
          </div>
          <p className={`text-sm text-white/90 leading-relaxed whitespace-pre-wrap break-words ${isExpanded ? 'line-clamp-none' : 'line-clamp-5 sm:line-clamp-4 md:line-clamp-3'}`}>
            {processedContent}
          </p>

          {placeholders.length > 0 && showInputs && (
            <div className="mt-4 space-y-3 interactive-area" onClick={e => e.stopPropagation()}>
              {placeholders.map(placeholder => (
                <div key={placeholder}>
                  <label htmlFor={`input-${prompt.id}-${placeholder}`} className="text-xs font-semibold text-white/80 block mb-1.5 capitalize">
                    {t('promptCard.variableInputLabel', { placeholder: placeholder.replace(/_/g, ' ') })}
                  </label>
                  <input
                    id={`input-${prompt.id}-${placeholder}`}
                    type="text"
                    value={placeholderValues[placeholder] || ''}
                    onChange={(e) => handleValueChange(placeholder, e.target.value)}
                    placeholder={t('promptCard.variableInputPlaceholder', { placeholder: placeholder.replace(/_/g, ' ') })}
                    className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>
          )}

          {showResponseArea && (
            <div className="mt-4 pt-4 border-t border-white/20 interactive-area">
              {isLoading && !geminiResponse && (
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin-fast"></div>
                  <span className="font-medium">{t('promptCard.generating')}</span>
                </div>
              )}
              {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-lg text-sm font-medium">{error}</div>}
              {geminiResponse && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold text-white/90">{t('promptCard.responseTitle')}</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopy(geminiResponse, "toast.responseCopied"); }}
                        className="text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-md transition-colors"
                        aria-label={t('promptCard.copyResponseButton.aria')}
                      >
                        {t('promptCard.copyResponseButton')}
                      </button>
                      <button
                        onClick={handleClearResponse}
                        className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors"
                        aria-label={t('promptCard.clearResponseButton.aria')}
                        title={t('promptCard.clearResponseButton.aria')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="w-full text-left text-sm leading-relaxed markdown-content">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{ pre: (props) => <CodeBlock {...props} /> }}
                    >
                      {geminiResponse + (isLoading ? '...' : '')}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute right-3 top-3 flex items-center gap-2">
        <button
            onClick={handleRunPrompt}
            disabled={isLoading}
            className={`interactive-area w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
            isLoading ? 'cursor-not-allowed' : 'hover:bg-white/30'
            } ${hasPlaceholders && !isLoading ? 'opacity-50 cursor-help' : ''}`}
            aria-label={t('promptCard.runWithGeminiButton.aria')}
            title={hasPlaceholders ? t('promptCard.runWithGeminiButton.tooltipDisabled') : t('promptCard.runWithGeminiButton.tooltip')}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin-fast"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/90" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>
         {placeholders.length > 0 && (
           <button
             className="interactive-area w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-sm hover:bg-white/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
             onClick={(e) => { e.stopPropagation(); setShowInputs(prev => !prev); }}
             aria-label={t('promptCard.customizeButton.aria')}
             title={t('promptCard.customizeButton.tooltip')}
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/90" viewBox="0 0 20 20" fill="currentColor">
               <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
               <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
             </svg>
           </button>
        )}
        <div className="hidden sm:block text-xs font-mono px-2.5 py-1.5 rounded-full bg-white/20 border border-white/30 opacity-90 select-none pointer-events-none">
          {t('promptCard.copyChip')}
        </div>
      </div>
    </div>
  );
};

export default PromptCard;
