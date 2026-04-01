import React, { useRef, useEffect, useState } from 'react';
import { Bookmark } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { ShareIcon } from './icons/ShareIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';

interface VerseActionMenuProps {
  verse: Bookmark;
  targetElement: HTMLElement;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

const VerseActionMenu: React.FC<VerseActionMenuProps & { onOpenNote: () => void }> = ({ verse, targetElement, onClose, isBookmarked, onToggleBookmark, onOpenNote }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && event.target !== targetElement) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose, targetElement]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse}`);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse}`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    onClose();
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse} ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
    onClose();
  };

  const handleShare = async () => {
    const shareData = {
      title: `${verse.book} ${verse.chapter}:${verse.verse}`,
      text: `"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for non-share API browsers can be implemented here
        alert('Share API not supported in your browser.');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    } finally {
        onClose();
    }
  };

  const menuPosition = {
    top: targetElement.offsetTop - 60, // Position above the verse
  };

  return (
    <div
      ref={menuRef}
      className="absolute left-1/2 -translate-x-1/2 z-20"
      style={menuPosition}
      role="menu"
    >
      <div className="flex items-center gap-2 bg-brand-dark text-white p-2 rounded-full shadow-lg">
        <button onClick={onToggleBookmark} className="p-3 hover:bg-white/10 rounded-full transition-colors" role="menuitem">
          <BookmarkIcon isFilled={isBookmarked} />
        </button>
        <button onClick={onOpenNote} className="p-3 hover:bg-white/10 rounded-full transition-colors" role="menuitem" aria-label="Add/Edit Note">✏️</button>
        <button onClick={handleCopy} className="p-3 hover:bg-white/10 rounded-full transition-colors" role="menuitem">
          {isCopied ? <span className="text-sm px-1">Copied!</span> : <CopyIcon />}
        </button>
        <button onClick={handleCopy} className="p-3 hover:bg-white/10 rounded-full transition-colors" role="menuitem">
          {isCopied ? <span className="text-sm px-1">Copied!</span> : <CopyIcon />}
        </button>
        <button onClick={handleTwitterShare} className="p-3 hover:bg-white/10 rounded-full transition-colors" role="menuitem" aria-label="Share on Twitter">
          🐦
        </button>
        <button onClick={handleWhatsAppShare} className="p-3 hover:bg-white/10 rounded-full transition-colors" role="menuitem" aria-label="Share on WhatsApp">
          📲
        </button>
        {/* Quick share buttons */}
        <button onClick={handleTwitterShare} className="p-3 hover:bg-white/10 rounded-full transition-colors" role="menuitem" aria-label="Share on Twitter">
          🐦
        </button>
        <button onClick={handleWhatsAppShare} className="p-3 hover:bg-white/10 rounded-full transition-colors" role="menuitem" aria-label="Share on WhatsApp">
          📲
        </button>
        <button onClick={handleShare} className="p-3 hover:bg-white/10 rounded-full transition-colors" role="menuitem" aria-label="Native share options">
          <ShareIcon />
        </button>
      </div>
    </div>
  );
};

export default VerseActionMenu;
