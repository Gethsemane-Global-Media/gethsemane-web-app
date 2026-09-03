import React, { useState, useEffect } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../utils/apiConfig';
import { Sermon, fetchSermons, getLocalSermonProgressMap } from '../services/sermonService';
import { SermonPlayerModal } from './SermonPlayerModal';

interface SermonProgressItem {
  id: number;
  user_id: number;
  sermon_id: number;
  played_seconds: number;
  total_seconds: number;
  is_completed: boolean;
  last_played_at: string;
  sermon: Sermon;
}

export const MessageTrackerPage: React.FC<{ onNavigateBack?: () => void }> = ({ onNavigateBack }) => {
  const [profile] = useUserProfile();
  const { user } = useAuth();
  const [progressItems, setProgressItems] = useState<SermonProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSermon, setActiveSermon] = useState<Sermon | null>(null);

  const API_BASE_URL = getApiBaseUrl();

  useEffect(() => {
    const fetchUserProgress = async () => {
      const activeUserId = user?.id ?? user?.userId ?? profile?.userId ?? profile?.id;
      const localMap = getLocalSermonProgressMap();

      try {
        // 1. Fetch available sermons to resolve titles & metadata for local IDs
        const allSermonsRes = await fetchSermons({ per_page: 500 });
        const sermonsList = allSermonsRes.data || [];
        const sermonMap = new Map<number, Sermon>(sermonsList.map((s) => [s.id, s]));

        let remoteItems: SermonProgressItem[] = [];
        if (activeUserId) {
          try {
            const res = await fetch(`${API_BASE_URL}/users/${activeUserId}/sermon-progress`);
            if (res.ok) {
              remoteItems = await res.json();
            }
          } catch (e) {
            console.warn('Remote sermon progress fetch failed, falling back to local map:', e);
          }
        }

        // 2. Merge remote records + local storage records
        const mergedMap = new Map<number, SermonProgressItem>();

        remoteItems.forEach((item) => {
          const matchedSermon = item.sermon || sermonMap.get(item.sermon_id);
          if (matchedSermon) {
            mergedMap.set(item.sermon_id, {
              ...item,
              sermon: matchedSermon,
            });
          }
        });

        Object.keys(localMap).forEach((idStr) => {
          const sId = parseInt(idStr, 10);
          if (localMap[sId] && !mergedMap.has(sId)) {
            const matchedSermon = sermonMap.get(sId);
            if (matchedSermon) {
              mergedMap.set(sId, {
                id: sId,
                user_id: activeUserId || 0,
                sermon_id: sId,
                played_seconds: 3600,
                total_seconds: 3600,
                is_completed: true,
                last_played_at: new Date().toISOString(),
                sermon: matchedSermon,
              });
            }
          }
        });

        setProgressItems(Array.from(mergedMap.values()));
      } catch (err) {
        console.warn('Could not load sermon progress items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProgress();
  }, [user?.id, user?.userId, profile?.userId, profile?.id]);

  const totalPlayedSeconds = progressItems.reduce((acc, curr) => acc + (curr.played_seconds || 0), 0);
  const totalHours = (totalPlayedSeconds / 3600).toFixed(1);
  const completedCount = progressItems.filter((i) => i.is_completed).length;
  const inProgressCount = progressItems.filter((i) => !i.is_completed).length;

  return (
    <div className="flex-1 w-full max-w-full p-4 sm:p-6 pb-28 overflow-x-hidden">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-200/80 p-5 sm:p-6 shadow-sm mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-[11px] font-semibold uppercase tracking-wider">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 20V10M18 20V4M6 20v-4" />
            </svg>
            <span>Growth Telemetry</span>
          </div>
          {onNavigateBack && (
            <button
              onClick={onNavigateBack}
              className="text-xs text-brand-secondary hover:text-brand-dark px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 font-semibold transition-colors"
            >
              Back
            </button>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-brand-dark tracking-tight mt-1">Message Listening Tracker</h1>
        <p className="mt-1.5 text-xs sm:text-sm text-brand-secondary leading-relaxed">
          Accountability metrics for audio & video sermons consumed across ministry archives.
        </p>

        {profile.student && (
          <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-800 text-xs font-semibold">
            <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            Linked Rooted Student: {profile.student.matric_number}
          </div>
        )}
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
        <div className="rounded-2xl bg-white border border-gray-200/80 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-brand-secondary uppercase tracking-wider">Total Time Streamed</span>
          <div className="mt-1.5 text-2xl font-extrabold text-brand-dark">{totalHours} hrs</div>
          <p className="mt-0.5 text-xs text-gray-400">Spiritual feeding & teachings</p>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200/80 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Completed</span>
          <div className="mt-1.5 text-2xl font-extrabold text-emerald-700">{completedCount}</div>
          <p className="mt-0.5 text-xs text-gray-400">Messages finished entirely</p>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200/80 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-brand-dark uppercase tracking-wider">In Progress</span>
          <div className="mt-1.5 text-2xl font-extrabold text-brand-dark">{inProgressCount}</div>
          <p className="mt-0.5 text-xs text-gray-400">Currently active sermons</p>
        </div>
      </div>

      {/* History List */}
      <div className="rounded-3xl bg-white border border-gray-200/80 p-5 sm:p-6 shadow-sm">
        <h2 className="text-base font-bold text-brand-dark mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Listening History & Resume Points
        </h2>

        {loading ? (
          <div className="py-12 text-center text-brand-secondary text-xs">Loading listening telemetry...</div>
        ) : progressItems.length === 0 ? (
          <div className="py-12 text-center text-brand-secondary text-xs leading-relaxed">
            No tracked sermon listening activity yet. Start listening to any message in the Church Library to automatically record your spiritual milestones.
          </div>
        ) : (
          <div className="space-y-3.5">
            {progressItems.map((item) => {
              const minutes = Math.floor((item.played_seconds || 0) / 60);
              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-brand-bg/60 border border-gray-200/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded">
                        {item.sermon?.service_type || 'Sermon'}
                      </span>
                      {item.is_completed && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                          Completed
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-brand-dark mt-1.5 truncate">{item.sermon?.title || 'Unknown Title'}</h3>
                    <p className="text-xs text-brand-secondary mt-0.5 truncate">
                      Speaker: {item.sermon?.speaker || 'Apostle David Dauda'} • Listened {minutes} mins
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveSermon(item.sermon)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-dark hover:bg-neutral-800 text-white text-xs font-semibold shadow-sm transition-all shrink-0"
                  >
                    <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Resume Message
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeSermon && (
        <SermonPlayerModal sermon={activeSermon} onClose={() => setActiveSermon(null)} />
      )}
    </div>
  );
};
