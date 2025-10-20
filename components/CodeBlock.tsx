import React, { useState } from 'react';

// This type is a simplified version of what react-markdown passes down
interface CodeBlockProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  onCopy: (message?: string) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ className, children, onCopy, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : 'text';
  
  // Children is an array, we need to extract the text content
  const codeText = React.Children.toArray(children).reduce((acc: string, child) => {
    if (typeof child === 'string') {
      return acc + child;
    }
    // You might need more complex logic here if you have nested elements in `code`
    return acc;
  }, '').replace(/\n$/, '');

  const handleCopy = async () => {
    if (isCopied) return;
    try {
      await navigator.clipboard.writeText(codeText);
      onCopy("Kód skopírovaný ✓");
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
      onCopy("Chyba pri kopírovaní");
    }
  };

  return (
    <div className="relative group">
      <pre {...props} className={className}>
        {children}
      </pre>
      <button 
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 rounded-md bg-white/10 border border-white/20 text-xs font-sans text-white/80 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {isCopied ? 'Skopírované!' : lang}
      </button>
    </div>
  );
};

export default CodeBlock;