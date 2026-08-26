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

export const recordSermonProgress = async (
  sermonId: number,
  data: {
    media_type?: string;
    current_time_seconds?: number;
    duration_seconds?: number;
    completed?: boolean;
  }
): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/sermons/${sermonId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
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

