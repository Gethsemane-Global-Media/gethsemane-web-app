import React, { useState, useEffect, useMemo } from 'react';
import { getAnnouncements, Announcement } from '../services/communityService';
import { formatDisplayDate } from '../utils/dateUtils';

interface Props {
  onNavigateBack: () => void;
}

export const AnnouncementsPage: React.FC<Props> = ({ onNavigateBack }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    getAnnouncements()
      .then((data) => setAnnouncements(data || []))
      .catch((err) => console.error('Failed to load announcements:', err))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    announcements.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set);
  }, [announcements]);

  const filtered = useMemo(() => {
    return announcements.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [announcements, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-brand-bg pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200/80 bg-white/90 px-4 py-3 backdrop-blur-md">
        <button
          onClick={onNavigateBack}
          className="flex items-center gap-1.5 rounded-full p-2 text-brand-dark hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-xs font-semibold">Home</span>
        </button>

        <h1 className="text-xs font-bold text-brand-dark">News & Announcements</h1>

        <div className="w-8" />
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-4 space-y-4">
        {/* Banner */}
        <div className="rounded-3xl bg-brand-dark p-5 sm:p-6 text-white shadow-sm">
          <span className="inline-block rounded-full bg-brand-green/20 px-3 py-1 text-[11px] font-semibold text-brand-green">
            Ministry Bulletin
          </span>
          <h2 className="mt-1.5 text-xl font-bold">Community News & Updates</h2>
          <p className="text-xs text-neutral-300">
            Apostolic communiqués, school notices, convention dates, and prophetic announcements.
          </p>
        </div>

        {/* Search & Filter Pills */}
        <div className="rounded-3xl bg-white p-4 border border-gray-200 shadow-xs space-y-3">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-3 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl bg-brand-bg pl-10 pr-4 py-2.5 text-xs text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/30 border border-gray-200"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-brand-dark text-white shadow-xs'
                  : 'bg-gray-100 text-brand-secondary hover:text-brand-dark'
              }`}
            >
              All Bulletins
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-brand-dark text-white shadow-xs'
                    : 'bg-gray-100 text-brand-secondary hover:text-brand-dark'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="py-12 text-center text-xs text-brand-secondary">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-green border-t-transparent mb-2"></div>
            <p>Loading bulletins...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center text-xs text-brand-secondary border border-gray-200 shadow-xs">
            No announcements found.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-3xl bg-white p-5 border border-gray-200 shadow-xs transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-brand-secondary">
                    <span className="rounded-full bg-brand-green/10 px-2.5 py-0.5 font-bold text-brand-green uppercase text-[10px]">
                      {item.category || 'General'}
                    </span>
                    <span>{formatDisplayDate(item.published_at)}</span>
                  </div>

                  <h3 className="text-sm font-bold text-brand-dark leading-snug">
                    {item.title}
                  </h3>

                  <div className="text-xs text-brand-secondary leading-relaxed">
                    {isExpanded ? (
                      <p className="whitespace-pre-line">{item.content}</p>
                    ) : (
                      <p className="line-clamp-3">{item.content}</p>
                    )}
                  </div>

                  {item.content.length > 180 && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="text-xs font-bold text-brand-green hover:underline pt-1 cursor-pointer"
                    >
                      {isExpanded ? 'Show Less' : 'Read Full Announcement →'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
