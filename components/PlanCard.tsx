import React from 'react';
import { Plan } from '../types';

interface PlanCardProps {
  plan: Plan;
  onSeeMore: (plan: Plan) => void;
  className?: string;
}

const formatParticipantCount = (count: number): string => {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
};

const PlanCard: React.FC<PlanCardProps> = ({ plan, onSeeMore, className = 'mt-8' }) => {
  const isCommunity = plan.type === 'community';

  return (
    <div className={`bg-white p-6 rounded-3xl border border-gray-200/70 ${className}`}>
      <div
        className={`inline-block text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 ${
          isCommunity ? 'bg-[#5B4D4D]' : 'bg-brand-green'
        }`}
      >
        {isCommunity ? 'Community plan' : 'My plan'}
      </div>
      <h2 className="text-3xl font-bold text-brand-dark leading-tight">{plan.title}</h2>
      <p className="text-brand-secondary mt-3 mb-5 leading-relaxed text-[15px]">
        {plan.description}
      </p>

      {isCommunity && plan.participantCount !== undefined && (
        <div className="flex items-center gap-2 mb-5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-secondary shrink-0">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span className="text-sm text-brand-secondary">
            <span className="font-semibold text-brand-dark">{formatParticipantCount(plan.participantCount)}</span> reading this plan
          </span>
        </div>
      )}

      <div className="flex justify-between items-center gap-4">
        <span className="text-sm font-medium text-brand-primary">
          {plan.details.duration}
        </span>
        <button
          onClick={() => onSeeMore(plan)}
          className="shrink-0 px-6 py-2.5 bg-[#212631] text-white rounded-full font-semibold text-sm hover:bg-opacity-90 transition-colors"
        >
          {isCommunity && !plan.startDate ? 'Join' : 'See more'}
        </button>
      </div>
    </div>
  );
};

export default PlanCard;
