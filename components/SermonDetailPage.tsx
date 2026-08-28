import React, { useState, useEffect, useRef } from 'react';
import {
  Sermon,
  recordSermonProgress,
  getLocalSermonProgressMap,
  toggleSermonCompleted,
} from '../services/sermonService';
import { getYouTubeEmbedUrl, getYouTubeVideoId } from '../utils/mediaUtils';
import { formatDisplayDate } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';

interface Props {
  sermon: Sermon;
  onNavigateBack: () => void;
}

export const SermonDetailPage: React.FC<Props> = ({ sermon, onNavigateBack }) => {
  const { user } = useAuth();
  const hasPlayableVideo = Boolean(sermon.youtube_video_url && getYouTubeVideoId(sermon.youtube_video_url));
  const embedUrl = getYouTubeEmbedUrl(sermon.youtube_video_url);
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>(hasPlayableVideo ? 'video' : 'audio');

  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    const map = getLocalSermonProgressMap();
    return Boolean(map[sermon.id]);
  });

  const [watchProgressSeconds, setWatchProgressSeconds] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Periodically sync progress telemetry to backend API
  useEffect(() => {
    // Record initial view event
    recordSermonProgress(sermon.id, {
      user_id: user?.id,
      media_type: activeTab,
      current_time_seconds: 0,
      completed: isCompleted,
    });

    const interval = setInterval(() => {
      if (activeTab === 'audio' && audioRef.current && !audioRef.current.paused) {
        const currentTime = Math.floor(audioRef.current.currentTime);
        const duration = Math.floor(audioRef.current.duration || 1);
        const percent = Math.floor((currentTime / duration) * 100);

        recordSermonProgress(sermon.id, {
          user_id: user?.id,
          media_type: 'audio',
          current_time_seconds: currentTime,
          duration_seconds: duration,
          completed: percent >= 90 || isCompleted,
        });

        if (percent >= 90 && !isCompleted) {
          setIsCompleted(true);
        }
      }
    }, 15000); // sync every 15 seconds

    return () => clearInterval(interval);
  }, [sermon.id, activeTab, user?.id, isCompleted]);

  const handleToggleListened = async () => {
    const newState = await toggleSermonCompleted(sermon.id, user?.id);
    setIsCompleted(newState);
  };

  const renderMarkdownNotes = (notes?: string) => {
    if (!notes) {
      return (
        <div className="py-4 text-center text-[11px] text-brand-secondary italic">
          No scriptural notes recorded for this ministration.
        </div>
      );
    }

    const lines = notes.split('\n');
    return (
      <div className="space-y-2 text-[11.5px] leading-relaxed text-brand-dark">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-xs font-bold text-brand-dark pt-1.5 pb-0.5 border-b border-gray-100">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={idx} className="text-sm font-extrabold text-brand-dark pt-2 pb-0.5 border-b border-gray-200">
                {trimmed.replace('## ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h2 key={idx} className="text-base font-black text-brand-dark pt-2 pb-0.5">
                {trimmed.replace('# ', '')}
              </h2>
            );
          }
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote
                key={idx}
                className="border-l-2 border-brand-green pl-2.5 py-1 bg-brand-green/5 rounded-r-lg text-brand-dark font-serif italic text-[11px]"
              >
                {trimmed.replace('> ', '')}
              </blockquote>
            );
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 ml-0.5 text-[11px]">
                <span className="text-brand-green font-bold shrink-0">•</span>
                <span>{trimmed.substring(2)}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="text-[11px] text-brand-secondary">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-bg pb-28">
      {/* Top Sticky App Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200/80 bg-white/95 px-3.5 py-2.5 backdrop-blur-md">
        <button
          onClick={onNavigateBack}
          className="flex items-center gap-1 rounded-full px-2 py-1 text-brand-dark hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-xs font-bold">Library</span>
        </button>

        <div className="text-xs font-bold text-brand-dark truncate max-w-[200px]">
          {sermon.title}
        </div>

        <button
          onClick={handleToggleListened}
          className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
            isCompleted
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'bg-gray-100 text-brand-secondary hover:text-brand-dark'
          }`}
        >
          {isCompleted ? (
            <>
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Listened</span>
            </>
          ) : (
            <span>Mark Listened</span>
          )}
        </button>
      </div>

      <div className="mx-auto max-w-2xl px-3.5 sm:px-5 pt-3 space-y-3">
        {/* Compact Media Player Card */}
        <div className="overflow-hidden rounded-2xl bg-white border border-gray-200/90 shadow-2xs">
          {/* Compact Media Selector Tabs */}
          <div className="flex border-b border-gray-100 p-1.5 gap-1.5 bg-gray-50/60">
            {hasPlayableVideo && (
              <button
                onClick={() => setActiveTab('video')}
                className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'video'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-white text-brand-secondary hover:text-brand-dark border border-gray-200/60'
                }`}
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>YouTube Video</span>
              </button>
            )}

            {sermon.has_audio && (
              <button
                onClick={() => setActiveTab('audio')}
                className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'audio'
                    ? 'bg-brand-dark text-white shadow-2xs'
                    : 'bg-white text-brand-secondary hover:text-brand-dark border border-gray-200/60'
                }`}
              >
                <svg className="w-3 h-3 fill-none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                </svg>
                <span>Audio Stream</span>
              </button>
            )}
          </div>

          {/* Player Viewport */}
          <div className="bg-black/95">
            {activeTab === 'video' && embedUrl ? (
              <div className="relative aspect-video w-full">
                <iframe
                  src={embedUrl}
                  title={sermon.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="p-5 text-center space-y-3 bg-gradient-to-b from-neutral-900 to-neutral-950 text-white">
                <div className="w-12 h-12 mx-auto rounded-full bg-brand-green/20 border border-brand-green/30 flex items-center justify-center text-brand-green">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white">Apostolic Audio Ministration</h4>
                  <p className="text-[10.5px] text-neutral-400 mt-0.5">Duration: {sermon.duration || 'Full Ministration'}</p>
                </div>

                {sermon.telegram_audio_url && (
                  <div className="pt-1">
                    <a
                      href={sermon.telegram_audio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green hover:bg-emerald-600 text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                      </svg>
                      <span>Listen on Telegram Audio CDN</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Compact Message Metadata Card */}
        <div className="rounded-2xl bg-white p-3.5 sm:p-4 border border-gray-200/90 shadow-2xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-[10px] font-extrabold text-brand-green">
                {sermon.service_type}
              </span>
              {sermon.series && (
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  {sermon.series.title} {sermon.series_part ? `(${sermon.series_part})` : ''}
                </span>
              )}
            </div>

            <button
              onClick={handleToggleListened}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-brand-dark'
              }`}
            >
              {isCompleted ? '✓ Completed' : 'Mark as Listened'}
            </button>
          </div>

          <h1 className="text-base sm:text-lg font-black text-brand-dark leading-tight">
            {sermon.title}
          </h1>

          <div className="flex items-center gap-2 text-[11px] text-brand-secondary pt-1 border-t border-gray-100">
            <span>Ministered by <strong className="text-brand-dark font-bold">{sermon.speaker}</strong></span>
            <span>•</span>
            <span>{formatDisplayDate(sermon.date_preached) || `${sermon.month || ''} ${sermon.year || ''}`}</span>
          </div>
        </div>

        {/* Compact Scripture Notes & Markdown Card */}
        <div className="rounded-2xl bg-white p-3.5 sm:p-4 border border-gray-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-xs font-bold text-brand-dark">Apostolic Notes & Scripture Anchors</h3>
            </div>
          </div>

          {renderMarkdownNotes(sermon.sermon_notes)}
        </div>
      </div>
    </div>
  );
};
