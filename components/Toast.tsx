
import React from 'react';

interface ToastProps {
  message: string;
  show: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, show }) => {
  const toastClasses = [
    'fixed left-1/2 bottom-7 z-50',
    'px-4 py-2.5 rounded-full',
    'bg-black/70 text-white text-sm backdrop-blur-sm',
    'border border-white/20',
    'transition-all duration-300 ease-in-out',
    show ? 'opacity-100 -translate-x-1/2 translate-y-0' : 'opacity-0 -translate-x-1/2 translate-y-4 pointer-events-none'
  ].join(' ');

  return (
    <div className={toastClasses} role="status" aria-live="polite">
      {message}
    </div>
  );
};

export default Toast;
