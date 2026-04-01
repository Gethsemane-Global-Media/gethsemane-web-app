import React, { useState } from 'react';
import { communityPlan, moreCommunityPlans } from '../data/plans';
import { Plan } from '../types';
import PlanCard from './PlanCard';

interface PlanPageProps {
  userPlans: Plan[];
  onNavigateToCreatePlan: () => void;
  onNavigateToPlanDetail: (plan: Plan) => void;
}

const PlanPage: React.FC<PlanPageProps> = ({ userPlans, onNavigateToCreatePlan, onNavigateToPlanDetail }) => {
    const [activeTab, setActiveTab] = useState('discover');

    const TabButton: React.FC<{ tab: string; label: string; onClick: (tab: string) => void }> = ({ tab, label, onClick }) => {
        const isActive = activeTab === tab;
        return (
            <button
                onClick={() => onClick(tab)}
                className={`pb-2 font-medium text-lg transition-colors duration-200 ${
                    isActive
                        ? 'text-brand-primary border-b-2 border-brand-primary'
                        : 'text-brand-secondary hover:text-brand-primary'
                }`}
                aria-pressed={isActive}
            >
                {label}
            </button>
        );
    };

    return (
        <main className="flex-grow p-6 pt-2 overflow-y-auto pb-28">
            <h1 className="text-4xl font-medium text-brand-primary mb-2">Plans</h1>
            <p className="text-brand-secondary mb-8">
                Choose any plan that suits your schedule and grow in the word.
            </p>

            <div className="flex items-center space-x-8">
                <TabButton tab="my-plans" label="My plans" onClick={setActiveTab} />
                <TabButton tab="discover" label="Discover" onClick={setActiveTab} />
            </div>

            {/* Discover Tab Content */}
            {activeTab === 'discover' && (
                <div className="mt-8">
                    <button onClick={onNavigateToCreatePlan} className="w-full py-5 bg-brand-dark text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors">
                        Create your own plan
                    </button>
                    
                    <PlanCard plan={communityPlan} onSeeMore={onNavigateToPlanDetail} />

                    <h3 className="text-lg font-medium text-brand-primary mt-8">More plans</h3>
                    {moreCommunityPlans.map(plan => (
                        <PlanCard key={plan.id} plan={plan} onSeeMore={onNavigateToPlanDetail} />
                    ))}
                </div>
            )}
            
            {/* My Plans Tab Content */}
            {activeTab === 'my-plans' && (
                <div className="mt-8">
                    {userPlans.length > 0 ? (
                        userPlans.map(plan => (
                             <PlanCard key={plan.id} plan={plan} onSeeMore={onNavigateToPlanDetail} />
                        ))
                    ) : (
                        <div className="mt-10 text-center text-brand-secondary">
                            <p>You haven't created any plans yet.</p>
                             <p className="mt-2 text-sm">Create a new plan to get started.</p>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
};

export default PlanPage;