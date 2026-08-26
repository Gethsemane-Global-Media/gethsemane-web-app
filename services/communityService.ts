/**
 * Community & Announcements Service for The Bible Experience App.
 */

export interface Announcement {
  id: number;
  title: string;
  content: string;
  category?: string;
  badge_text?: string;
  action_url?: string;
  published_at: string;
}

import { getApiBaseUrl } from '../utils/apiConfig';

const API_BASE = getApiBaseUrl();

export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const res = await fetch(`${API_BASE}/community/announcements`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    // Return structured default announcements if backend is unreachable
    return [
      {
        id: 1,
        title: 'Kingdom Convergence 2026: The Mantle of Ruach',
        content: 'Registration is now open for all disciples across GFC, GWD, GSOM, and ESG cohorts. Join us for 4 days of apostolic empowerment and spiritual fire.',
        category: 'Convention',
        badge_text: 'Apostolic Gathering',
        action_url: 'https://gkni.org',
        published_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Second Quarter Discipleship Matriculation & Cohort Wave Release',
        content: 'New course modules and video lectures have been uploaded to the Rooted LMS. All students are advised to check their classroom portal.',
        category: 'Academic',
        badge_text: 'Admissions Notice',
        action_url: 'https://gkni.org',
        published_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 3,
        title: 'Weekly Corporate Intercession & Night of Priesthood',
        content: 'Every Friday at 11:00 PM (WAT). Connect to the global audio stream for 3 hours of territorial prayers and prophetic alignment.',
        category: 'Service',
        badge_text: 'Prayer Vigil',
        action_url: 'https://t.me/GKNI_Official',
        published_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    ];
  }
}
