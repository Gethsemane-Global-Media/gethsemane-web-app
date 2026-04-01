import React from 'react';
import { Plan } from '../types';

interface PlanCardProps {
  plan: Plan;
  onSeeMore: (plan: Plan) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onSeeMore }) => {
  const isCommunity = plan.type === 'community';
  
  return (
    <div className="mt-8 bg-[#FDFCF7] p-6 rounded-3xl border border-gray-200/80 shadow-sm">
      <div className={`inline-block text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 ${isCommunity ? 'bg-[#8A7F7C]' : 'bg-brand-green'}`}>
        {isCommunity ? 'Community plan' : 'My plan'}
      </div>
      <h2 className="text-3xl font-bold text-brand-dark">{plan.title}</h2>
      <p className="text-brand-secondary mt-2 mb-6 leading-relaxed">
        {plan.description}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-brand-primary">
          {isCommunity ? 'Starting tomorrow' : `${plan.details.duration}`}
        </span>
        <button onClick={() => onSeeMore(plan)} className="px-8 py-3 bg-brand-dark text-white rounded-full font-semibold text-sm hover:bg-opacity-90 transition-colors">
          See more
        </button>
      </div>
    </div>
  );
};

export default PlanCard;
