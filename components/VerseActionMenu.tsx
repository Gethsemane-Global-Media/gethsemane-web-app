import React, { useRef, useEffect, useState } from 'react';
import { Bookmark } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { ShareIcon } from './icons/ShareIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { EditIcon } from './icons/EditIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { TwitterXIcon } from './icons/TwitterXIcon';

interface VerseActionMenuProps {
  verse: Bookmark;
  targetElement: HTMLElement;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onOpenNote: () => void;
}

const VerseActionMenu: React.FC<VerseActionMenuProps> = ({
  verse,
  targetElement,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onOpenNote,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        event.target !== targetElement
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose, targetElement]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse}`
      );
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(
      `"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse}`
    );
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    onClose();
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse} ${window.location.origin}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
    onClose();
  };

  const handleShare = async () => {
    const shareData = {
      title: `${verse.book} ${verse.chapter}:${verse.verse}`,
      text: `"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse}`,
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await handleCopy();
      }
    } catch (err) {
      console.error('Error sharing:', err);
    } finally {
      onClose();
    }
  };

  const menuPosition = {
    top: Math.max(8, targetElement.offsetTop - 56),
  };

  return (
    <div
      ref={menuRef}
      className="absolute left-1/2 -translate-x-1/2 z-30 animate-fade-in"
      style={menuPosition}
      role="menu"
      aria-label="Verse Actions"
    >
      <div className="flex items-center gap-1 bg-neutral-900/95 text-white px-2 py-1.5 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
        <button
          onClick={onToggleBookmark}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            isBookmarked
              ? 'bg-amber-500/20 text-amber-400'
              : 'hover:bg-white/10 text-neutral-300 hover:text-white'
          }`}
          role="menuitem"
          aria-label={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
          title={isBookmarked ? 'Bookmarked' : 'Bookmark'}
        >
          <BookmarkIcon isFilled={isBookmarked} />
        </button>

        <button
          onClick={onOpenNote}
          className="p-2 hover:bg-white/10 text-neutral-300 hover:text-white rounded-xl transition-all cursor-pointer"
          role="menuitem"
          aria-label="Add/Edit Note"
          title="Add Note"
        >
          <EditIcon size={18} />
        </button>

        <button
          onClick={handleCopy}
          className="p-2 hover:bg-white/10 text-neutral-300 hover:text-white rounded-xl transition-all cursor-pointer"
          role="menuitem"
          aria-label="Copy verse"
          title="Copy"
        >
          {isCopied ? (
            <span className="text-[11px] font-bold text-emerald-400 px-1">Copied</span>
          ) : (
            <CopyIcon />
          )}
        </button>

        <button
          onClick={handleWhatsAppShare}
          className="p-2 hover:bg-white/10 text-neutral-300 hover:text-emerald-400 rounded-xl transition-all cursor-pointer"
          role="menuitem"
          aria-label="Share on WhatsApp"
          title="WhatsApp"
        >
          <WhatsAppIcon size={18} />
        </button>

        <button
          onClick={handleTwitterShare}
          className="p-2 hover:bg-white/10 text-neutral-300 hover:text-sky-400 rounded-xl transition-all cursor-pointer"
          role="menuitem"
          aria-label="Share on X"
          title="X / Twitter"
        >
          <TwitterXIcon size={16} />
        </button>

        <button
          onClick={handleShare}
          className="p-2 hover:bg-white/10 text-neutral-300 hover:text-white rounded-xl transition-all cursor-pointer"
          role="menuitem"
          aria-label="Share options"
          title="Share"
        >
          <ShareIcon />
        </button>
      </div>
    </div>
  );
};

export default VerseActionMenu;
