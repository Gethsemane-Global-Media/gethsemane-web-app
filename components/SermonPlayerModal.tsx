import React, { useState } from 'react';
import { Sermon } from '../services/sermonService';

interface Props {
  sermon: Sermon;
  onClose: () => void;
}

export const SermonPlayerModal: React.FC<Props> = ({ sermon, onClose }) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'video'>(sermon.has_video && sermon.youtube_video_url ? 'video' : 'audio');

  // Extract YouTube embed ID
  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
  };

  const embedUrl = getYouTubeEmbedUrl(sermon.youtube_video_url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-gray-200 p-5 sm:p-6 text-brand-dark shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-gray-100">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-green/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-green">
              {sermon.service_type}
            </div>
            <h3 className="mt-1.5 text-lg font-bold leading-snug text-brand-dark">{sermon.title}</h3>
            <p className="text-xs text-brand-secondary mt-0.5 truncate">
              Ministered by <strong className="text-brand-dark font-semibold">{sermon.speaker}</strong> • {sermon.date_preached || `${sermon.month || ''} ${sermon.year || ''}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-dark transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Media Selector Tabs */}
        <div className="flex gap-2 my-3.5">
          {sermon.has_audio && (
            <button
              onClick={() => setActiveTab('audio')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'audio'
                  ? 'bg-brand-dark text-white shadow-sm'
                  : 'bg-gray-100 text-brand-secondary hover:text-brand-dark hover:bg-gray-200'
              }`}
            >
              Audio Stream
            </button>
          )}
          {sermon.has_video && sermon.youtube_video_url && (
            <button
              onClick={() => setActiveTab('video')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'video'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-gray-100 text-brand-secondary hover:text-brand-dark hover:bg-gray-200'
              }`}
            >
              YouTube Video
            </button>
          )}
        </div>

        {/* Media Player Area */}
        <div className="my-3.5 rounded-2xl bg-brand-bg border border-gray-200 overflow-hidden min-h-[200px] flex items-center justify-center p-4">
          {activeTab === 'video' && embedUrl ? (
            <iframe
              src={embedUrl}
              title={sermon.title}
              className="w-full h-64 rounded-xl shadow-sm"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full text-center space-y-3.5 py-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-brand-green/10 border border-brand-green/20 flex items-center justify-center text-brand-green shadow-sm">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>

              <div>
                <p className="text-sm font-semibold text-brand-dark">High Quality Ministry Audio Ministration</p>
                <p className="text-xs text-brand-secondary mt-0.5">Duration: {sermon.duration || 'Full Service'}</p>
              </div>

              {sermon.telegram_audio_url && (
                <a
                  href={sermon.telegram_audio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-dark hover:bg-neutral-800 text-white font-semibold text-xs transition-all shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                  <span>Listen on Official Telegram Archive</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        {sermon.sermon_notes && (
          <div className="mt-3.5 p-3.5 rounded-2xl bg-brand-bg border border-gray-200/80 text-xs text-brand-secondary">
            <strong className="text-brand-dark block mb-1">Key Scriptural Outlines:</strong>
            {sermon.sermon_notes}
          </div>
        )}
      </div>
    </div>
  );
};
