import React, { useState, useEffect, useMemo } from 'react';
import HomePage from './HomePage';
import SettingsPage from './SettingsPage';
import EditProfilePage from './EditProfilePage';
import NotificationSettingsPage from './NotificationSettingsPage';
import { HomeIcon } from './icons/HomeIcon';
import { BibleIcon } from './icons/BibleIcon';
import { PlanIcon } from './icons/PlanIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import PlanPage from './PlanPage';
import CreatePlanPage from './CreatePlanPage';
import PlanDetailPage from './PlanDetailPage';
import CalendarPage from './CalendarPage';
import { Plan } from '../types';
import { BIBLE_CHAPTERS } from '../data/bibleBooks';
import BiblePage from './BiblePage';
import ReadingCompletedPage from './ReadingCompletedPage';
import { useUserProfile } from '../hooks/useUserProfile';
import BookmarksPage from './BookmarksPage';

type AppView = 'home' | 'bible' | 'plan' | 'settings' | 'editProfile' | 'notificationSettings' | 'createPlan' | 'planDetail' | 'calendar' | 'readingCompleted' | 'bookmarks';

interface BibleNavTarget {
    book: string;
    chapter: number;
    verse: number | null;
}

const USER_PLANS_KEY = 'userPlans';

const generateReadingSchedule = (plan: Plan): string[] => {
    const schedule: string[] = [];
    if (!plan.details.books) return [];

    let currentChapter = 1;
    let currentBookIndex = 0;
    let chaptersReadInDay = 0;
    let dailyReading = '';

    while (currentBookIndex < plan.details.books.length) {
        const bookName = plan.details.books[currentBookIndex];
        const totalChapters = BIBLE_CHAPTERS[bookName] || 0;
        
        if (currentChapter > totalChapters) {
            currentBookIndex++;
            currentChapter = 1;
            continue;
        }

        const chaptersLeftInBook = totalChapters - currentChapter + 1;
        const chaptersToReadInBook = Math.min(chaptersLeftInBook, plan.details.chaptersPerDay - chaptersReadInDay);
        
        const startChapter = currentChapter;
        const endChapter = currentChapter + chaptersToReadInBook - 1;

        if (dailyReading) dailyReading += '; ';
        dailyReading += `${bookName} ${startChapter}`;
        if (endChapter > startChapter) {
            dailyReading += `-${endChapter}`;
        }

        chaptersReadInDay += chaptersToReadInBook;
        currentChapter = endChapter + 1;

        // FIX: Corrected typo from chaptersInDay to chaptersReadInDay
        if (chaptersReadInDay >= plan.details.chaptersPerDay) {
            schedule.push(dailyReading);
            dailyReading = '';
            chaptersReadInDay = 0;
        }

        if (currentChapter > totalChapters) {
            currentBookIndex++;
            currentChapter = 1;
        }
    }
    
    if (dailyReading) {
        schedule.push(dailyReading);
    }

    return schedule;
};

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [userPlans, setUserPlans] = useState<Plan[]>(() => {
    try {
      const savedPlans = window.localStorage.getItem(USER_PLANS_KEY);
      if (savedPlans) {
        const parsedPlans: Plan[] = JSON.parse(savedPlans);
        return parsedPlans.map(plan => ({
          ...plan,
          startDate: plan.startDate ? new Date(plan.startDate) : undefined,
        }));
      }
    } catch (error) {
      console.error("Error reading user plans from localStorage:", error);
    }
    return [];
  });
  const [isCreatePlanDirty, setIsCreatePlanDirty] = useState(false);
  const [profile] = useUserProfile();
  const [bibleNavTarget, setBibleNavTarget] = useState<BibleNavTarget | null>(null);

  const activePlan = useMemo(() => {
    return userPlans
      .filter(p => p.startDate)
      .sort((a, b) => new Date(b.startDate!).getTime() - new Date(a.startDate!).getTime())[0] || null;
  }, [userPlans]);


  useEffect(() => {
    try {
        window.localStorage.setItem(USER_PLANS_KEY, JSON.stringify(userPlans));
    } catch (error) {
        console.error("Error saving user plans to localStorage:", error);
    }
  }, [userPlans]);


  const handleNavigation = (targetView: AppView, force: boolean = false) => {
    if (!force && currentView === 'createPlan' && isCreatePlanDirty) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
        return; 
      }
    }
    if (currentView === 'createPlan' && targetView !== 'createPlan') {
      setIsCreatePlanDirty(false);
    }
    setCurrentView(targetView);
  };


  const handleAddPlan = (planData: { title: string; description: string; chaptersPerDay: number; books: string[] }) => {
    const totalChapters = planData.books.reduce((sum, book) => sum + (BIBLE_CHAPTERS[book] || 0), 0);
    const durationInDays = Math.ceil(totalChapters / planData.chaptersPerDay);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationInDays);
    const endMonth = endDate.toLocaleString('default', { month: 'long' });

    const newPlan: Plan = {
      id: `user-plan-${Date.now()}`,
      title: planData.title,
      description: planData.description || `A custom plan to read ${planData.books.length} books.`,
      longDescription: planData.description,
      type: 'user',
      details: {
        duration: `${durationInDays} days`,
        ends: endMonth,
        chaptersPerDay: planData.chaptersPerDay,
        books: planData.books,
      },
    };

    setUserPlans(prevPlans => [...prevPlans, newPlan]);
    handleNavigation('plan', true);
  };
  
  const handleStartPlan = (planToStart: Plan) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const startedPlan: Plan = { ...planToStart, startDate: now, progress: 0, type: 'user' };

    const isAlreadyUserPlan = userPlans.some(p => p.id === planToStart.id);

    if (isAlreadyUserPlan) {
      setUserPlans(prevPlans =>
        prevPlans.map(p => (p.id === planToStart.id ? startedPlan : p))
      );
    } else {
      setUserPlans(prevPlans => [...prevPlans, startedPlan]);
    }
    
    setSelectedPlan(startedPlan);
  };
  
  const handleCompleteReading = (planId: string) => {
    const planToUpdate = userPlans.find(p => p.id === planId);
    if (!planToUpdate || !planToUpdate.startDate) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const planStartDate = new Date(planToUpdate.startDate);
    planStartDate.setHours(0, 0, 0, 0);

    const dayOfPlan = Math.floor((today.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const readingSchedule = generateReadingSchedule(planToUpdate);
    const durationInDays = readingSchedule.length;

    if (durationInDays > 0) {
        const newProgress = Math.min(100, Math.round(((dayOfPlan + 1) / durationInDays) * 100));
        const updatedPlan = { ...planToUpdate, progress: newProgress };
        
        setUserPlans(prevPlans => prevPlans.map(p => p.id === planId ? updatedPlan : p));
        setSelectedPlan(updatedPlan);
        handleNavigation('readingCompleted', true);
    }
  };
  
  const handleNavigateToVerse = (book: string, chapter: number, verse: number | null) => {
    setBibleNavTarget({ book, chapter, verse });
    handleNavigation('bible', true);
  };
  
  const handleContinueReading = (book: string, chapter: number) => {
    handleNavigateToVerse(book, chapter, 1);
  };


  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomePage 
                  userProfile={profile} 
                  activePlan={activePlan}
                  onNavigateToPlan={() => handleNavigation('plan', true)}
                  onContinueReading={handleContinueReading}
                />;
      case 'bible':
        return <BiblePage 
                    initialTarget={bibleNavTarget}
                    onNavigationHandled={() => setBibleNavTarget(null)}
                />;
      case 'plan':
        return <PlanPage 
                  userPlans={userPlans}
                  onNavigateToCreatePlan={() => handleNavigation('createPlan')} 
                  onNavigateToPlanDetail={(plan) => {
                    const currentUserPlan = userPlans.find(p => p.id === plan.id);
                    setSelectedPlan(currentUserPlan || plan);
                    handleNavigation('planDetail');
                  }}
                />;
      case 'settings':
        return <SettingsPage 
                  onNavigateToEditProfile={() => handleNavigation('editProfile')} 
                  onNavigateToNotificationSettings={() => handleNavigation('notificationSettings')}
                  onNavigateToCreatePlan={() => handleNavigation('createPlan')}
                  onNavigateToBookmarks={() => handleNavigation('bookmarks')}
                  onNavigateBack={() => handleNavigation('home')}
                />;
      case 'editProfile':
        return <EditProfilePage onNavigateBack={() => handleNavigation('settings')} />;
      case 'notificationSettings':
        return <NotificationSettingsPage onNavigateBack={() => handleNavigation('settings')} />;
      case 'createPlan':
        return <CreatePlanPage 
                  onNavigateBack={() => handleNavigation('plan')}
                  onAddPlan={handleAddPlan}
                  setIsDirty={setIsCreatePlanDirty}
                />;
      case 'planDetail':
        return selectedPlan && <PlanDetailPage 
                                  plan={selectedPlan}
                                  onNavigateBack={() => handleNavigation('plan')}
                                  onNavigateToCalendar={() => handleNavigation('calendar')} 
                                  onStartPlan={handleStartPlan}
                                  onCompleteReading={handleCompleteReading}
                                />;
      case 'calendar':
        return selectedPlan && <CalendarPage 
                                  plan={selectedPlan}
                                  onNavigateBack={() => handleNavigation('planDetail')} 
                                />;
      case 'readingCompleted':
        return <ReadingCompletedPage 
                  planProgress={selectedPlan?.progress || 0}
                  onNavigateBack={() => handleNavigation('home')}
               />;
      case 'bookmarks':
        return <BookmarksPage
                  onNavigateBack={() => handleNavigation('settings')}
                  onNavigateToVerse={handleNavigateToVerse}
               />;
      default:
        return <HomePage 
                  userProfile={profile} 
                  activePlan={activePlan}
                  onNavigateToPlan={() => handleNavigation('plan', true)}
                  onContinueReading={handleContinueReading}
                />;
    }
  };
  
  const NavButton: React.FC<{ tab: 'home' | 'bible' | 'plan' | 'settings'; label: string; icon: React.ReactNode }> = ({ tab, label, icon }) => {
    const isSettingsSubView = ['editProfile', 'notificationSettings', 'bookmarks'].includes(currentView);
    const isPlanSubView = ['planDetail', 'createPlan', 'calendar', 'readingCompleted'].includes(currentView);
    const isActive = currentView === tab || (tab === 'settings' && isSettingsSubView) || (tab === 'plan' && isPlanSubView);
    
    const activeClasses = 'text-brand-accent bg-brand-nav-active-bg font-semibold';
    const inactiveClasses = 'text-brand-inactive';

    return (
        <button 
            onClick={() => handleNavigation(tab)}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl w-20 py-2 transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
        >
            {icon}
            <span className="text-xs">{label}</span>
        </button>
    );
  };

  const isHeaderHidden = [
    'editProfile',
    'notificationSettings',
    'createPlan',
    'calendar',
    'planDetail',
    'settings',
    'bible',
    'readingCompleted',
    'bookmarks'
  ].includes(currentView);


  return (
    <div className="bg-brand-bg min-h-screen max-w-md mx-auto flex flex-col">
      {!isHeaderHidden && currentView === 'home' ? (
          <header className="flex items-center justify-between p-6 h-20 shrink-0">
            <div className="flex items-center gap-2">
                <div className="h-10 w-px bg-brand-green" />
                <span className="text-3xl font-medium tracking-wider text-brand-green">GSOM</span>
            </div>
            <p className="text-brand-primary text-sm">welcome, {profile.name.split(' ')[0]}</p>
          </header>
        ) : !isHeaderHidden ? (
          <header className="flex items-center p-6 h-20 shrink-0">
            <div className="flex items-center">
              <span className="h-8 w-px bg-green-700 mr-2"></span>
              <span className="text-2xl font-medium tracking-wider text-brand-primary">GSOM</span>
            </div>
          </header>
      ) : null}

      {renderContent()}

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-brand-bg/95 backdrop-blur-sm border-t border-gray-200/80 z-30">
          <div className="flex justify-around items-center h-20">
              <NavButton tab="home" label="Home" icon={<HomeIcon />} />
              <NavButton tab="bible" label="Bible" icon={<BibleIcon />} />
              <NavButton tab="plan" label="Plan" icon={<PlanIcon />} />
              <NavButton tab="settings" label="Settings" icon={<SettingsIcon />} />
          </div>
        </footer>
    </div>
  );
};

export default MainApp;