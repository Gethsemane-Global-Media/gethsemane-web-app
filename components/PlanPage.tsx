import React, { useState, useEffect } from 'react';
import { getCommunityPlans, fetchLiveCommunityPlans } from '../services/planService';
import { Plan, PlanCategory } from '../types';
import PlanCard from './PlanCard';

interface PlanPageProps {
  userPlans: Plan[];
  onNavigateToCreatePlan: () => void;
  onNavigateToPlanDetail: (plan: Plan) => void;
}

const CATEGORY_FILTERS: { label: string; value: PlanCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'New Testament', value: 'new-testament' },
  { label: 'Old Testament', value: 'old-testament' },
  { label: 'Gospels', value: 'gospels' },
  { label: 'Epistles', value: 'epistles' },
  { label: 'Devotional', value: 'devotional' },
];

const PlanPage: React.FC<PlanPageProps> = ({
  userPlans,
  onNavigateToCreatePlan,
  onNavigateToPlanDetail,
}) => {
  const [communityPlans, setCommunityPlans] = useState<Plan[]>(() => getCommunityPlans());
  const [activeTab, setActiveTab] = useState('discover');
  const [activeCategory, setActiveCategory] = useState<PlanCategory | 'all'>('all');

  useEffect(() => {
    fetchLiveCommunityPlans().then((plans) => {
      if (plans && plans.length > 0) {
        setCommunityPlans(plans);
      }
    });
  }, []);

  const filteredPlans = activeCategory === 'all'
    ? communityPlans
    : communityPlans.filter((p) => p.category === activeCategory);

  const TabButton: React.FC<{ tab: string; label: string }> = ({ tab, label }) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        className={`text-lg transition-colors duration-200 cursor-pointer ${
          isActive ? 'text-brand-dark font-semibold' : 'text-brand-neutral font-normal'
        }`}
        aria-pressed={isActive}
      >
        {label}
      </button>
    );
  };

  return (
    <main className="flex-grow px-4 sm:px-6 pt-2 overflow-y-auto pb-36">
      <h1 className="text-3xl sm:text-4xl font-bold text-brand-dark leading-tight">Plans</h1>
      <p className="text-brand-secondary mt-2 mb-6 text-sm leading-relaxed">
        Choose any community reading plan designed by GKNI discipleship leaders or create your own custom schedule.
      </p>

      <div className="flex items-center gap-8">
        <TabButton tab="my-plans" label="My plans" />
        <TabButton tab="discover" label="Discover" />
      </div>

      {activeTab === 'discover' && (
        <div className="mt-5">
          <button
            onClick={onNavigateToCreatePlan}
            className="w-full py-4 bg-brand-dark text-white rounded-2xl font-bold text-base hover:bg-neutral-800 shadow-sm transition-all cursor-pointer"
          >
            + Create your own custom plan
          </button>

          {/* Category filter pills */}
          <div className="flex gap-2 mt-5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORY_FILTERS.map(({ label, value }) => {
              const isActive = activeCategory === value;
              return (
                <button
                  key={value}
                  onClick={() => setActiveCategory(value)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-dark text-white shadow-2xs'
                      : 'bg-white border border-gray-200 text-brand-secondary hover:text-brand-dark'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-brand-secondary mt-3 mb-1 font-medium">
            {filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''} available
          </p>

          {filteredPlans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSeeMore={onNavigateToPlanDetail}
              className={index === 0 ? 'mt-2' : 'mt-4'}
            />
          ))}

          {filteredPlans.length === 0 && (
            <div className="mt-10 text-center text-brand-secondary">
              <p>No plans in this category yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'my-plans' && (
        <div className="mt-6">
          {userPlans.length > 0 ? (
            userPlans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSeeMore={onNavigateToPlanDetail}
                className={index === 0 ? 'mt-0' : 'mt-4'}
              />
            ))
          ) : (
            <div className="mt-8 rounded-2xl bg-white border border-gray-200/80 p-8 text-center text-brand-secondary shadow-2xs">
              <p className="font-semibold text-brand-dark text-sm">You haven&apos;t joined any plans yet.</p>
              <p className="mt-1 text-xs">Discover a GKNI community plan or create your own custom schedule.</p>
              <button
                onClick={() => setActiveTab('discover')}
                className="mt-4 px-4 py-2 bg-brand-green text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all cursor-pointer"
              >
                Browse Community Plans
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default PlanPage;
