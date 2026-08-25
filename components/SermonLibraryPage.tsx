import React, { useState, useEffect } from 'react';
import { fetchSermons, fetchSermonSeries, Sermon, SermonSeries } from '../services/sermonService';
import { SermonPlayerModal } from './SermonPlayerModal';

export const SermonLibraryPage: React.FC<{ onNavigateToTracker?: () => void }> = ({ onNavigateToTracker }) => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [seriesList, setSeriesList] = useState<SermonSeries[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<number | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSermon, setActiveSermon] = useState<Sermon | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sermonsRes, seriesRes] = await Promise.all([
        fetchSermons({ search: searchTerm, series_id: selectedSeries }),
        fetchSermonSeries(),
      ]);
      setSermons(sermonsRes.data);
      setSeriesList(seriesRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSeries]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="flex-1 w-full max-w-full p-4 sm:p-6 pb-28 overflow-x-hidden">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-200/80 p-5 sm:p-6 shadow-sm mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-[11px] font-semibold uppercase tracking-wider">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
            <span>Ministry Archive</span>
          </div>
          {onNavigateToTracker && (
            <button
              onClick={onNavigateToTracker}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-dark hover:bg-neutral-800 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20V10M18 20V4M6 20v-4" />
              </svg>
              <span>Tracker</span>
            </button>
          )}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight">Church Message Library</h1>
        <p className="mt-1.5 text-xs sm:text-sm text-brand-secondary leading-relaxed">
          Listen to anointed sermons, deep apostolic teachings, and worship ministrations preached within the ministry.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3 mb-6">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search by sermon title, speaker, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-sm text-brand-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 transition-all shadow-sm"
          />
          <svg
            className="absolute left-3.5 top-3 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </form>

        {/* Series chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedSeries(undefined)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedSeries === undefined
                ? 'bg-brand-dark text-white shadow-sm'
                : 'bg-white border border-gray-200 text-brand-secondary hover:text-brand-dark hover:bg-gray-50'
            }`}
          >
            All Sermons
          </button>
          {seriesList.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSeries(s.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedSeries === s.id
                  ? 'bg-brand-dark text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-brand-secondary hover:text-brand-dark hover:bg-gray-50'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Sermons Grid */}
      {loading ? (
        <div className="py-16 text-center text-brand-secondary text-sm">Loading anointed archives...</div>
      ) : sermons.length === 0 ? (
        <div className="py-16 text-center text-brand-secondary text-sm">
          No sermons found matching your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {sermons.map((sermon) => (
            <div
              key={sermon.id}
              onClick={() => setActiveSermon(sermon)}
              className="group cursor-pointer rounded-2xl bg-white border border-gray-200/80 p-4 hover:border-brand-dark/30 hover:shadow-md transition-all shadow-sm flex flex-col justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                {/* Extracted YouTube Thumbnail or Audio Crest */}
                {sermon.thumbnail_url ? (
                  <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 shadow-sm border border-gray-200">
                    <img
                      src={sermon.thumbnail_url}
                      alt={sermon.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {sermon.has_video && (
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-brand-dark/90 flex items-center justify-center shadow">
                          <svg className="w-3 h-3 text-white fill-white" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-24 h-16 rounded-xl shrink-0 bg-brand-bg border border-gray-200 flex items-center justify-center text-brand-dark shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-brand-green/10 text-brand-green text-[10px] font-semibold truncate">
                      {sermon.service_type}
                    </span>
                    {sermon.duration && (
                      <span className="text-[10px] font-mono text-gray-400 shrink-0">{sermon.duration}</span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-brand-dark group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug">
                    {sermon.title}
                  </h3>

                  <p className="text-[11px] text-brand-secondary mt-1 truncate">
                    {sermon.speaker}
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>{sermon.date_preached || `${sermon.month || ''} ${sermon.year || ''}`}</span>
                <div className="flex items-center gap-1.5">
                  {sermon.has_video && (
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-semibold">
                      Video
                    </span>
                  )}
                  {sermon.has_audio && (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-semibold">
                      Audio
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Player Modal */}
      {activeSermon && (
        <SermonPlayerModal sermon={activeSermon} onClose={() => setActiveSermon(null)} />
      )}
    </div>
  );
};
