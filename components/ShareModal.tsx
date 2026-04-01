import React, { useState, useEffect } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ShareModalProps {
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ onClose }) => {
  const [isCopied, setIsCopied] = useState(false);
  const shareUrl = window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  // Add styles for modal animation
  const styles = `
    @keyframes fade-in-scale {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-fade-in-scale { animation: fade-in-scale 0.2s ease-out forwards; }
  `;

  return (
    <>
      <style>{styles}</style>
      <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
      >
        <div 
          className="bg-white rounded-3xl p-6 m-4 w-full max-w-sm shadow-xl relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
          <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-brand-secondary hover:text-brand-dark"
              aria-label="Close"
          >
            <CloseIcon />
          </button>
          <h2 className="text-2xl font-bold text-brand-dark mb-4 text-center">Share with friends</h2>
          <p className="text-brand-secondary text-center mb-6">Copy the link below and share it with your friends.</p>
          
          <div className="relative">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="w-full bg-brand-bg border border-gray-200 rounded-xl p-3 pr-28 text-brand-primary text-sm"
              aria-label="Shareable link"
            />
            <button 
              onClick={handleCopy}
              className={`absolute right-1 top-1 bottom-1 flex items-center justify-center gap-2 px-3 rounded-lg font-semibold text-sm transition-colors ${
                  isCopied 
                  ? 'bg-brand-green text-white' 
                  : 'bg-brand-dark text-white hover:bg-opacity-90'
              }`}
            >
              <CopyIcon />
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShareModal;
