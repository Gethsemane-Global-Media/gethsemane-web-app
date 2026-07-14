/**
 * Plan Service — abstracts all plan data access.
 * Currently returns local mock data; swap the implementations below
 * for fetch() calls to the Laravel API when the backend is ready.
 *
 * e.g.  const response = await fetch('/api/plans?type=community');
 *       return response.json();
 */

import { featuredCommunityPlans } from '../data/plans';
import { Plan } from '../types';

/** Returns all available community plans. */
export function getCommunityPlans(): Plan[] {
  // TODO: replace with → fetch('/api/plans?type=community')
  return featuredCommunityPlans;
}

/** Returns a single community plan by id. */
export function getCommunityPlanById(id: string): Plan | undefined {
  // TODO: replace with → fetch(`/api/plans/${id}`)
  return featuredCommunityPlans.find(p => p.id === id);
}

/**
 * "Joins" a community plan for the current user.
 * Returns the plan with startDate set to today.
 * Backend version: POST /api/user/plans  { plan_id }
 */
export function joinCommunityPlan(plan: Plan): Plan {
  // TODO: replace with → fetch('/api/user/plans', { method: 'POST', body: JSON.stringify({ plan_id: plan.id }) })
  return { ...plan, startDate: new Date(), progress: 0 };
}
