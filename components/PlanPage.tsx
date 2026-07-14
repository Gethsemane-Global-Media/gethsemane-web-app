import React, { useState } from 'react';
import { getCommunityPlans } from '../services/planService';
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

const allCommunityPlans = getCommunityPlans();

const PlanPage: React.FC<PlanPageProps> = ({
  userPlans,
  onNavigateToCreatePlan,
  onNavigateToPlanDetail,
}) => {
  const [activeTab, setActiveTab] = useState('discover');
  const [activeCategory, setActiveCategory] = useState<PlanCategory | 'all'>('all');

  const filteredPlans = activeCategory === 'all'
    ? allCommunityPlans
    : allCommunityPlans.filter(p => p.category === activeCategory);

  const TabButton: React.FC<{ tab: string; label: string }> = ({ tab, label }) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        className={`font-medium text-lg transition-colors duration-200 ${
          isActive ? 'text-brand-dark' : 'text-brand-secondary'
        }`}
        aria-pressed={isActive}
      >
        {label}
      </button>
    );
  };

  return (
    <main className="flex-grow px-6 pt-2 overflow-y-auto pb-28">
      <h1 className="text-4xl font-bold text-brand-dark leading-tight">Plans</h1>
      <p className="text-brand-secondary mt-3 mb-8 text-[15px] leading-relaxed">
        Choose any plan that suits your schedule and grow in the word.
      </p>

      <div className="flex items-center gap-8">
        <TabButton tab="my-plans" label="My plans" />
        <TabButton tab="discover" label="Discover" />
      </div>

      {activeTab === 'discover' && (
        <div className="mt-6">
          <button
            onClick={onNavigateToCreatePlan}
            className="w-full py-5 bg-[#212631] text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors"
          >
            Create your own plan
          </button>

          {/* Category filter pills */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORY_FILTERS.map(({ label, value }) => {
              const isActive = activeCategory === value;
              return (
                <button
                  key={value}
                  onClick={() => setActiveCategory(value)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#212631] text-white'
                      : 'bg-white border border-gray-200 text-brand-secondary'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-brand-secondary mt-4 mb-1">
            {filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''} available
          </p>

          {filteredPlans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSeeMore={onNavigateToPlanDetail}
              className={index === 0 ? 'mt-3' : 'mt-6'}
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
        <div className="mt-8">
          {userPlans.length > 0 ? (
            userPlans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSeeMore={onNavigateToPlanDetail}
                className={index === 0 ? 'mt-0' : 'mt-6'}
              />
            ))
          ) : (
            <div className="mt-10 text-center text-brand-secondary">
              <p>You haven&apos;t joined any plans yet.</p>
              <p className="mt-2 text-sm">Discover a community plan or create your own.</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default PlanPage;
