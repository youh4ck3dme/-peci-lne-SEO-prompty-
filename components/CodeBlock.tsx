import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface CodeBlockProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ className, children, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);
  const { t } = useLanguage();
  
  const codeText = React.Children.toArray(children).reduce((acc: string, child) => {
    if (typeof child === 'string') {
      return acc + child;
    }
    return acc;
  }, '').replace(/\n$/, '');

  const handleCopy = async () => {
    if (isCopied) return;
    try {
      await navigator.clipboard.writeText(codeText);
      // We can't use onCopy prop here directly, so we use a toast-like mechanism or simple feedback
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
      alert(t("toast.copyError"));
    }
  };

  return (
    <div className="relative group">
      <pre {...props} className={className + " !p-4 !sm:p-5"}>
        <code>{children}</code>
      </pre>
      <button 
        onClick={handleCopy}
        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20"
        aria-label={t('codeBlock.copyButton.aria')}
      >
        {isCopied ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default CodeBlock;
