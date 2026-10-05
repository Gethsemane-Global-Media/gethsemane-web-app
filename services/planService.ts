import { featuredCommunityPlans } from '../data/plans';
import { Plan, PlanCategory } from '../types';
import { BIBLE_CHAPTERS, NEW_TESTAMENT_BOOKS, OLD_TESTAMENT_BOOKS } from '../data/bibleBooks';
import { getApiBaseUrl } from '../utils/apiConfig';

const SWR_PLANS_CACHE_KEY = 'rooted_community_plans_cache';

export interface RemoteCommunityPlan {
  id: number;
  title: string;
  description?: string;
  category: string;
  duration_days: number;
  days_data?: Array<{ day: number; title: string; reading: string; books?: string[]; chapters?: string }> | string;
  is_featured: boolean;
  is_active: boolean;
}

const mapCategory = (rawCategory: string): PlanCategory => {
  const cat = rawCategory.toLowerCase();
  if (cat.includes('epistle')) return 'epistles';
  if (cat.includes('gospel')) return 'gospels';
  if (cat.includes('new testament')) return 'new-testament';
  if (cat.includes('old testament')) return 'old-testament';
  return 'devotional';
};

const EPISTLES_BOOKS = [
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon'
];

const GOSPELS_BOOKS = ['Matthew', 'Mark', 'Luke', 'John', 'Acts'];

/**
 * Books a plan covers when the backend sends no per-day schedule (days_data).
 * Derived from the plan's category so a New Testament plan can never display
 * Pauline epistles (or any other mismatched set of books).
 */
const CATEGORY_FALLBACK_BOOKS: Record<PlanCategory, string[]> = {
  'new-testament': NEW_TESTAMENT_BOOKS,
  'old-testament': OLD_TESTAMENT_BOOKS,
  epistles: EPISTLES_BOOKS,
  gospels: GOSPELS_BOOKS,
  devotional: ['Psalms'],
};

export const transformRemotePlanToPlan = (remote: RemoteCommunityPlan): Plan => {
  let parsedDays: Array<{ day: number; reading: string; books?: string[] }> = [];
  if (Array.isArray(remote.days_data)) {
    parsedDays = remote.days_data;
  } else if (typeof remote.days_data === 'string') {
    try {
      parsedDays = JSON.parse(remote.days_data);
    } catch {
      parsedDays = [];
    }
  }

  const extractedBooks: string[] = [];
  parsedDays.forEach((d) => {
    if (d.books && Array.isArray(d.books)) {
      d.books.forEach((b) => {
        if (!extractedBooks.includes(b)) extractedBooks.push(b);
      });
    }
  });

  const category = mapCategory(remote.category);
  const books = extractedBooks.length > 0 ? extractedBooks : CATEGORY_FALLBACK_BOOKS[category];
  // Pace the plan against the chapters it actually spans, so a 90-day New
  // Testament track covers the whole canon instead of a fraction of it.
  const totalChapters = books.reduce((sum, book) => sum + (BIBLE_CHAPTERS[book] || 0), 0);
  const planDays = Math.max(1, remote.duration_days || 0);

  return {
    id: `community-plan-${remote.id}`,
    title: remote.title,
    description: remote.description || `A discipleship reading path across ${remote.duration_days} days.`,
    longDescription: remote.description || `Complete ${remote.title} in ${remote.duration_days} days. Walk through the scriptures daily with the global GKNI church community.`,
    type: 'community',
    category,
    participantCount: 1200 + remote.id * 150,
    details: {
      duration: `${remote.duration_days} days`,
      ends: 'Open Enrollment',
      chaptersPerDay: Math.max(1, Math.ceil(totalChapters / planDays)),
      books,
    },
  };
};

/**
 * Returns cached community plans instantly, or the bundled fallback list only
 * when nothing has been cached yet. A cached empty list means the backend has no
 * active plans and is honoured as-is.
 */
export function getCommunityPlans(): Plan[] {
  try {
    const cached = localStorage.getItem(SWR_PLANS_CACHE_KEY);
    if (cached) {
      const parsed: RemoteCommunityPlan[] = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return parsed.map(transformRemotePlanToPlan);
      }
    }
  } catch {
    // fallback
  }
  return featuredCommunityPlans;
}

/**
 * Fetches fresh community plans from the Rooted backend.
 * An empty array is a valid answer (no active plans) and is cached as such; the
 * bundled fallback list is only used when the request itself fails.
 */
export async function fetchLiveCommunityPlans(): Promise<Plan[]> {
  const API_BASE_URL = getApiBaseUrl();
  try {
    const res = await fetch(`${API_BASE_URL}/community/plans`);
    if (res.ok) {
      const data: RemoteCommunityPlan[] = await res.json();
      if (Array.isArray(data)) {
        try {
          localStorage.setItem(SWR_PLANS_CACHE_KEY, JSON.stringify(data));
        } catch {
          // ignore quota
        }
        return data.map(transformRemotePlanToPlan);
      }
    }
  } catch (err) {
    console.warn('Could not fetch live community plans from Rooted backend:', err);
  }
  return getCommunityPlans();
}

/** Returns a single community plan by id. */
export function getCommunityPlanById(id: string): Plan | undefined {
  const plans = getCommunityPlans();
  return plans.find((p) => p.id === id);
}

/**
 * "Joins" a community plan for the current user.
 */
export function joinCommunityPlan(plan: Plan): Plan {
  return { ...plan, startDate: new Date(), progress: 0 };
}
