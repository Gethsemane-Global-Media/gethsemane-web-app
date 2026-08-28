import { featuredCommunityPlans } from '../data/plans';
import { Plan, PlanCategory } from '../types';
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

  return {
    id: `community-plan-${remote.id}`,
    title: remote.title,
    description: remote.description || `A discipleship reading path across ${remote.duration_days} days.`,
    longDescription: remote.description || `Complete ${remote.title} in ${remote.duration_days} days. Walk through the scriptures daily with the global GKNI church community.`,
    type: 'community',
    category: mapCategory(remote.category),
    participantCount: 1200 + remote.id * 150,
    details: {
      duration: `${remote.duration_days} days`,
      ends: 'Open Enrollment',
      chaptersPerDay: Math.max(1, Math.round(parsedDays.length > 0 ? parsedDays.length / remote.duration_days : 4)),
      books: extractedBooks.length > 0 ? extractedBooks : ['Romans', 'Galatians', 'Ephesians'],
    },
  };
};

/** Returns all cached or fallback community plans instantly. */
export function getCommunityPlans(): Plan[] {
  try {
    const cached = localStorage.getItem(SWR_PLANS_CACHE_KEY);
    if (cached) {
      const parsed: RemoteCommunityPlan[] = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(transformRemotePlanToPlan);
      }
    }
  } catch {
    // fallback
  }
  return featuredCommunityPlans;
}

/** Fetches fresh community plans from Rooted Backend API with SWR caching. */
export async function fetchLiveCommunityPlans(): Promise<Plan[]> {
  const API_BASE_URL = getApiBaseUrl();
  try {
    const res = await fetch(`${API_BASE_URL}/community/plans`);
    if (res.ok) {
      const data: RemoteCommunityPlan[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
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
