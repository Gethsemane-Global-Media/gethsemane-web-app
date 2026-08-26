import React, { useState, useEffect, useMemo } from 'react';
import { getSermons, getSermonSeries, Sermon, SermonSeries } from '../services/sermonService';
import { getYouTubeThumbnail, getYouTubeVideoId } from '../utils/mediaUtils';
import { formatDisplayDate } from '../utils/dateUtils';

interface Props {
  onNavigateToTracker?: () => void;
  onSelectSermon: (sermon: Sermon) => void;
}

const SWR_SERMONS_CACHE_KEY = 'rooted_sermons_library_cache';
const SWR_SERIES_CACHE_KEY = 'rooted_sermon_series_cache';

export const SermonLibraryPage: React.FC<Props> = ({ onNavigateToTracker, onSelectSermon }) => {
  // Stale-While-Revalidate: Instant hydrate from localStorage
  const [sermons, setSermons] = useState<Sermon[]>(() => {
    try {
      const cached = localStorage.getItem(SWR_SERMONS_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [seriesList, setSeriesList] = useState<SermonSeries[]>(() => {
    try {
      const cached = localStorage.getItem(SWR_SERIES_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(sermons.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'video' | 'audio'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sermonRes, seriesRes] = await Promise.all([
          getSermons({ per_page: 500 }),
          getSermonSeries(),
        ]);

        const incomingSermons = sermonRes.data || [];
        setSermons(incomingSermons);
        setSeriesList(seriesRes || []);

        // Persist to local SWR cache
        try {
          localStorage.setItem(SWR_SERMONS_CACHE_KEY, JSON.stringify(incomingSermons));
          localStorage.setItem(SWR_SERIES_CACHE_KEY, JSON.stringify(seriesRes || []));
        } catch {
          // ignore localStorage quota errors
        }
      } catch (err) {
        console.error('Failed to fetch sermons:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Unified series options from backend + current loaded sermons
  const availableSeriesOptions = useMemo(() => {
    const map = new Map<string, string>(); // value -> label
    seriesList.forEach((s) => {
      if (s.id && s.title) {
        map.set(s.id.toString(), s.title);
      }
    });
    sermons.forEach((sermon) => {
      if (sermon.series && sermon.series.id && sermon.series.title) {
        map.set(sermon.series.id.toString(), sermon.series.title);
      } else if (sermon.sermon_series_id && sermon.series?.title) {
        map.set(sermon.sermon_series_id.toString(), sermon.series.title);
      }
    });
    return Array.from(map.entries()).map(([val, label]) => ({ value: val, label }));
  }, [seriesList, sermons]);

  const filteredSermons = useMemo(() => {
    return sermons.filter((sermon) => {
      const matchesSearch =
        searchQuery === '' ||
        sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sermon.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sermon.sermon_notes && sermon.sermon_notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSeries =
        selectedSeries === 'all' ||
        (sermon.sermon_series_id && sermon.sermon_series_id.toString() === selectedSeries) ||
        (sermon.series?.id && sermon.series.id.toString() === selectedSeries) ||
        (sermon.series?.title && sermon.series.title.toLowerCase() === selectedSeries.toLowerCase());

      const matchesMedia =
        mediaFilter === 'all' ||
        (mediaFilter === 'video' && (sermon.has_video || Boolean(sermon.youtube_video_url))) ||
        (mediaFilter === 'audio' && (sermon.has_audio || Boolean(sermon.telegram_audio_url)));

      return matchesSearch && matchesSeries && matchesMedia;
    });
  }, [sermons, searchQuery, selectedSeries, mediaFilter]);

  return (
    <div className="min-h-screen px-3.5 sm:px-5 pt-3 pb-32 space-y-3 max-w-full overflow-hidden">
      {/* Compact Top Banner */}
      <div className="rounded-2xl bg-brand-dark p-4 sm:p-5 text-white shadow-xs flex items-center justify-between gap-3">
        <div>
          <span className="inline-block rounded-full bg-brand-green/25 px-2.5 py-0.5 text-[10px] font-bold text-brand-green">
            GKNI Media Archive
          </span>
          <h2 className="mt-1 text-base sm:text-lg font-black tracking-tight">Church Message Library</h2>
          <p className="text-[11px] text-neutral-300">
            {sermons.length > 0 ? `${sermons.length} apostolic teachings & archives` : 'Apostolic teachings & archives'}
          </p>
        </div>

        {onNavigateToTracker && (
          <button
            onClick={onNavigateToTracker}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold backdrop-blur-md transition-all shrink-0 cursor-pointer shadow-xs"
          >
            <svg className="w-3.5 h-3.5 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Tracker</span>
          </button>
        )}
      </div>

      {/* Compact Search and Filter Bar */}
      <div className="rounded-2xl bg-white p-3 border border-gray-200/90 shadow-2xs space-y-2.5">
        {/* Search Input */}
        <div className="relative">
          <svg
            className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search messages, ministers, or scriptures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-brand-bg pl-9 pr-3.5 py-2 text-xs text-brand-dark focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-green/40 border border-gray-200/80"
          />
        </div>

        {/* Filter Chips Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
          <button
            onClick={() => setMediaFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 cursor-pointer text-[11px] ${
              mediaFilter === 'all'
                ? 'bg-brand-dark text-white shadow-2xs'
                : 'bg-gray-100 text-brand-secondary hover:text-brand-dark'
            }`}
          >
            All ({sermons.length})
          </button>
          <button
            onClick={() => setMediaFilter('video')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 cursor-pointer text-[11px] ${
              mediaFilter === 'video'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-gray-100 text-brand-secondary hover:text-brand-dark'
            }`}
          >
            Video
          </button>
          <button
            onClick={() => setMediaFilter('audio')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 cursor-pointer text-[11px] ${
              mediaFilter === 'audio'
                ? 'bg-brand-dark text-white shadow-2xs'
                : 'bg-gray-100 text-brand-secondary hover:text-brand-dark'
            }`}
          >
            Audio
          </button>

          {availableSeriesOptions.length > 0 && (
            <select
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
              aria-label="Filter sermons by series"
              className="px-2.5 py-1 rounded-lg font-semibold bg-gray-100 text-brand-secondary hover:text-brand-dark border-0 text-[11px] cursor-pointer shrink-0"
            >
              <option value="all">All Series ({availableSeriesOptions.length})</option>
              {availableSeriesOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Compact Sermon Cards List (High Information Density) */}
      {loading && sermons.length === 0 ? (
        <div className="py-10 text-center text-xs text-brand-secondary">
          <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand-green border-t-transparent mb-2"></div>
          <p>Loading {sermons.length || ''} message archive...</p>
        </div>
      ) : filteredSermons.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center text-xs text-brand-secondary border border-gray-200 shadow-2xs">
          No sermons found matching your filter criteria.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredSermons.map((sermon) => {
            const hasPlayableVideo = Boolean(sermon.youtube_video_url && getYouTubeVideoId(sermon.youtube_video_url));
            const thumbnail = sermon.thumbnail_url || (sermon.youtube_video_url ? getYouTubeThumbnail(sermon.youtube_video_url) : null);

            return (
              <div
                key={sermon.id}
                onClick={() => onSelectSermon(sermon)}
                className="group relative flex flex-col justify-between rounded-2xl bg-white p-3 border border-gray-200/90 shadow-2xs hover:shadow-xs hover:border-brand-green/40 transition-all cursor-pointer overflow-hidden"
              >
                <div className="flex items-center gap-3">
                  {/* Compact 16:9 Thumbnail */}
                  <div className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden bg-neutral-900 shrink-0 shadow-2xs flex items-center justify-center border border-gray-200/60">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={sermon.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-brand-dark text-brand-green">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                    )}
                    {hasPlayableVideo && (
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-rose-600/90 flex items-center justify-center text-white shadow-2xs">
                          <svg className="w-2.5 h-2.5 fill-current ml-0.5" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sermon Details */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-[9.5px] font-extrabold text-brand-green truncate max-w-[140px]">
                        {sermon.service_type}
                      </span>
                      {sermon.series && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9.5px] font-medium text-brand-secondary truncate max-w-[110px]">
                          {sermon.series.title}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs font-bold text-brand-dark leading-tight line-clamp-2 group-hover:text-brand-green transition-colors">
                      {sermon.title}
                    </h3>

                    <p className="text-[11px] text-brand-secondary truncate">
                      {sermon.speaker}
                    </p>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-gray-100/90 flex items-center justify-between text-[10px] text-gray-400">
                  <span>{formatDisplayDate(sermon.date_preached) || `${sermon.month || ''} ${sermon.year || ''}`}</span>
                  <div className="flex items-center gap-1.5">
                    {hasPlayableVideo && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 font-bold text-[9.5px]">
                        Video
                      </span>
                    )}
                    {sermon.has_audio && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-[9.5px]">
                        Audio
                      </span>
                    )}
                    {sermon.duration && (
                      <span className="text-gray-400 font-mono text-[9.5px]">{sermon.duration}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
