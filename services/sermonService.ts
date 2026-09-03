import { getApiBaseUrl } from '../utils/apiConfig';

// Dynamic API Base configuration for Rooted Backend
const API_BASE_URL = getApiBaseUrl();

export interface Sermon {
  id: number;
  title: string;
  series_part?: string;
  date_preached?: string;
  month?: string;
  year?: number;
  service_type: string;
  speaker: string;
  ministration_type?: string;
  duration?: string;
  telegram_audio_url?: string;
  youtube_video_url?: string;
  thumbnail_url?: string;
  sermon_notes?: string;
  has_video: boolean;
  has_audio: boolean;
  series?: {
    id: number;
    title: string;
    description?: string;
  };
}

export interface SermonSeries {
  id: number;
  title: string;
  description?: string;
  sermons_count?: number;
}

export interface SermonMetadata {
  speakers: string[];
  service_types: string[];
  years: number[];
}

export const fetchSermons = async (params: {
  search?: string;
  series_id?: number;
  speaker?: string;
  service_type?: string;
  page?: number;
  per_page?: number;
}): Promise<{ data: Sermon[]; current_page: number; last_page: number; total: number }> => {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.series_id) query.append('series_id', String(params.series_id));
    if (params.speaker) query.append('speaker', params.speaker);
    if (params.service_type) query.append('service_type', params.service_type);
    if (params.page) query.append('page', String(params.page));
    query.append('per_page', String(params.per_page || 500));

    const response = await fetch(`${API_BASE_URL}/sermons?${query.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to load sermons: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Backend API offline or unreachable, returning fallback mock/cached sermons:', error);
    return {
      data: [
        {
          id: 1,
          title: 'Ministering Unto The Lord',
          service_type: 'Graduation Service',
          speaker: 'Apostle David Dauda',
          duration: '01:17:19',
          telegram_audio_url: 'https://t.me/GKNI_Official/92',
          has_audio: true,
          has_video: false,
          date_preached: '2023-11-11',
          month: 'November',
          year: 2023,
        },
        {
          id: 7,
          title: 'How Shall This Be',
          service_type: 'Monthly Contact',
          speaker: 'Apostle David Dauda',
          duration: '02:06:00',
          telegram_audio_url: 'https://t.me/GKNI_Official/198',
          youtube_video_url: 'https://youtu.be/CqOZ2Wy7iG4',
          has_audio: true,
          has_video: true,
          date_preached: '2024-02-29',
          month: 'February',
          year: 2024,
        },
        {
          id: 8,
          title: 'The House of Prayer',
          service_type: 'Monthly Contact',
          speaker: 'Apostle David Dauda',
          duration: '02:57:09',
          telegram_audio_url: 'https://t.me/GKNI_Official/203',
          youtube_video_url: 'https://youtu.be/2Xyk-G2CQYc',
          has_audio: true,
          has_video: true,
          date_preached: '2024-03-28',
          month: 'March',
          year: 2024,
        },
      ],
      current_page: 1,
      last_page: 1,
      total: 3,
    };
  }
};

export const fetchSermonSeries = async (): Promise<SermonSeries[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sermons/series`);
    if (!response.ok) throw new Error('Failed to fetch series');
    return await response.json();
  } catch (error) {
    console.warn('Using fallback series list:', error);
    return [
      { id: 1, title: 'Dominion Over Territories and Unrighteousness' },
      { id: 2, title: 'I Will Build My Church' },
      { id: 3, title: 'The Faith Of The Fathers' },
    ];
  }
};

export const getSermons = fetchSermons;
export const getSermonSeries = fetchSermonSeries;

const PROGRESS_CACHE_KEY = 'rooted_user_sermon_progress_map';

export const getLocalSermonProgressMap = (): Record<number, boolean> => {
  try {
    const raw = localStorage.getItem(PROGRESS_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const setLocalSermonProgress = (sermonId: number, isCompleted: boolean): void => {
  try {
    const map = getLocalSermonProgressMap();
    map[sermonId] = isCompleted;
    localStorage.setItem(PROGRESS_CACHE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage quota errors
  }
};

export const fetchUserSermonProgress = async (userId?: number): Promise<Record<number, boolean>> => {
  const localMap = getLocalSermonProgressMap();
  if (!userId) return localMap;

  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/sermon-progress`);
    if (res.ok) {
      const items: Array<{ sermon_id: number; is_completed: boolean }> = await res.json();
      const updatedMap = { ...localMap };
      items.forEach((item) => {
        if (item.is_completed) {
          updatedMap[item.sermon_id] = true;
        }
      });
      localStorage.setItem(PROGRESS_CACHE_KEY, JSON.stringify(updatedMap));
      return updatedMap;
    }
  } catch (err) {
    console.warn('Using cached sermon progress:', err);
  }
  return localMap;
};

export const toggleSermonCompleted = async (
  sermonId: number,
  userId?: number,
  targetState?: boolean
): Promise<boolean> => {
  const currentMap = getLocalSermonProgressMap();
  const newState = targetState !== undefined ? targetState : !currentMap[sermonId];
  
  // 1. Optimistic local update (0ms latency)
  setLocalSermonProgress(sermonId, newState);

  // 2. Async backend sync if user is authenticated
  if (userId) {
    try {
      await fetch(`${API_BASE_URL}/sermons/${sermonId}/mark-listened`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          is_listened: newState,
        }),
      });
    } catch (err) {
      console.warn('Failed to sync mark-listened toggle to backend API:', err);
    }
  }

  return newState;
};

export const recordSermonProgress = async (
  sermonId: number,
  data: {
    user_id?: number;
    media_type?: string;
    current_time_seconds?: number;
    duration_seconds?: number;
    completed?: boolean;
  }
): Promise<void> => {
  if (data.completed) {
    setLocalSermonProgress(sermonId, true);
  }
  if (!data.user_id) return;

  try {
    await fetch(`${API_BASE_URL}/sermons/${sermonId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        user_id: data.user_id,
        played_seconds: data.current_time_seconds || 0,
        total_seconds: data.duration_seconds || 0,
        is_completed: data.completed || false,
      }),
    });
  } catch (err) {
    // Non-blocking telemetry sync
  }
};

export const syncSermonProgress = async (
  userId: number,
  sermonId: number,
  playedSeconds: number,
  totalSeconds: number,
  isCompleted: boolean
): Promise<void> => {
  if (isCompleted) {
    setLocalSermonProgress(sermonId, true);
  }
  try {
    await fetch(`${API_BASE_URL}/sermons/${sermonId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        played_seconds: playedSeconds,
        total_seconds: totalSeconds,
        is_completed: isCompleted,
      }),
    });
  } catch (err) {
    console.error('Failed to sync sermon progress with Rooted API:', err);
  }
};

