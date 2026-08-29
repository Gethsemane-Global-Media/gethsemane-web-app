import React, { useState, useEffect, useMemo } from 'react';
import HomePage from './HomePage';
import SettingsPage from './SettingsPage';
import EditProfilePage from './EditProfilePage';
import NotificationSettingsPage from './NotificationSettingsPage';
import { HomeIcon } from './icons/HomeIcon';
import { BibleIcon } from './icons/BibleIcon';
import { PlanIcon } from './icons/PlanIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { NotificationIcon } from './icons/NotificationIcon';
import { AvatarIcon } from './icons/AvatarIcon';
import PlanPage from './PlanPage';
import CreatePlanPage from './CreatePlanPage';
import PlanDetailPage from './PlanDetailPage';
import CalendarPage from './CalendarPage';
import { Plan } from '../types';
import { BIBLE_CHAPTERS } from '../data/bibleBooks';
import BiblePage from './BiblePage';
import ReadingCompletedPage from './ReadingCompletedPage';
import { useUserProfile, getFirstName } from '../hooks/useUserProfile';
import { useAuth } from '../context/AuthContext';
import BookmarksPage from './BookmarksPage';
import ReminderBanner from './ReminderBanner';
import { getStoredNotificationSettings } from '../hooks/useNotificationSettings';
import { SermonLibraryPage } from './SermonLibraryPage';
import { SermonDetailPage } from './SermonDetailPage';
import { MessageTrackerPage } from './MessageTrackerPage';
import { AnnouncementsPage } from './AnnouncementsPage';
import { DiscipleshipPage } from './DiscipleshipPage';
import { GivingPage } from './GivingPage';
import { Sermon } from '../services/sermonService';
import { MessageIcon } from './icons/MessageIcon';
import {
  useDailyReminder,
  isTodayScheduled,
  getScheduledDateToday,
  wasReminderFiredToday,
  markReminderFiredToday,
} from '../hooks/useDailyReminder';

type AppView =
  | 'home'
  | 'bible'
  | 'sermons'
  | 'sermonDetail'
  | 'messageTracker'
  | 'announcements'
  | 'discipleship'
  | 'giving'
  | 'plan'
  | 'settings'
  | 'editProfile'
  | 'notificationSettings'
  | 'createPlan'
  | 'planDetail'
  | 'calendar'
  | 'readingCompleted'
  | 'bookmarks';

interface BibleNavTarget {
    book: string;
    chapter: number;
    verse: number | null;
}

interface PlanReadingSession {
  planId: string;
  book: string;
  startChapter: number;
  endChapter: number;
}

const parseChapterRange = (chapters: string): { start: number; end: number } => {
  if (chapters.includes('-')) {
    const [startStr, endStr] = chapters.split('-');
    const start = parseInt(startStr.trim(), 10);
    const end = parseInt(endStr.trim(), 10);
    return { start, end: Number.isNaN(end) ? start : end };
  }
  const chapter = parseInt(chapters.trim(), 10);
  return { start: chapter, end: chapter };
};

const USER_PLANS_KEY = 'userPlans';

const getDailyCompletionKey = (planId: string) => {
  const today = new Date().toISOString().split('T')[0];
  return `dailyReadingCompleted-${planId}-${today}`;
};

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
  const [planReadingSession, setPlanReadingSession] = useState<PlanReadingSession | null>(null);
  const [isDailyTaskCompleted, setIsDailyTaskCompleted] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState(getStoredNotificationSettings);

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

  useEffect(() => {
    if (!activePlan) {
      setIsDailyTaskCompleted(false);
      return;
    }
    setIsDailyTaskCompleted(
      window.localStorage.getItem(getDailyCompletionKey(activePlan.id)) === 'true'
    );
  }, [activePlan, currentView]);

  useEffect(() => {
    if (currentView !== 'bible' && currentView !== 'readingCompleted') {
      setPlanReadingSession(null);
    }
  }, [currentView]);

  // Re-read saved notification settings when navigating (e.g. back from the settings page).
  useEffect(() => {
    setNotificationSettings(getStoredNotificationSettings());
  }, [currentView]);

  const { showBanner, dismissBanner } = useDailyReminder(notificationSettings, isDailyTaskCompleted);

  const todaysReading = useMemo(() => {
    if (!activePlan?.startDate) return null;

    const schedule = generateReadingSchedule(activePlan);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const planStartDate = new Date(activePlan.startDate);
    planStartDate.setHours(0, 0, 0, 0);

    const dayOfPlan = Math.floor((today.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const reading = dayOfPlan >= 0 && dayOfPlan < schedule.length ? schedule[dayOfPlan] : null;
    if (!reading) return null;

    const firstReading = reading.split('; ')[0];
    const parts = firstReading.split(' ');
    return {
      book: parts.slice(0, -1).join(' '),
      chapters: parts[parts.length - 1],
    };
  }, [activePlan]);

  // Fire a system notification at the scheduled time while the app is open.
  useEffect(() => {
    if (!isTodayScheduled(notificationSettings)) return;
    if (isDailyTaskCompleted) return;
    if (wasReminderFiredToday()) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const delay = getScheduledDateToday(notificationSettings).getTime() - Date.now();
    if (delay < 0) return; // Time already passed today; the in-app banner covers it.

    const timer = window.setTimeout(() => {
      if (wasReminderFiredToday()) return;
      markReminderFiredToday();

      const title = 'Gethsemane - Daily Reading';
      const body = activePlan
        ? `Time for today's reading: ${activePlan.title}`
        : 'Time for your daily Bible reading.';
      try {
        new Notification(title, { body, tag: 'behold-daily-reminder' });
      } catch {
        // Some platforms (e.g. Android Chrome) only allow notifications via the service worker.
        navigator.serviceWorker?.ready
          .then((registration) => registration.showNotification(title, { body, tag: 'behold-daily-reminder' }))
          .catch(() => {});
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [notificationSettings, isDailyTaskCompleted, activePlan]);


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

  const handleJoinPlan = (planToJoin: Plan) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    // Keep type as 'community' so the badge stays correct in My Plans
    const joinedPlan: Plan = { ...planToJoin, startDate: now, progress: 0 };

    const alreadyJoined = userPlans.some(p => p.id === planToJoin.id);
    if (!alreadyJoined) {
      setUserPlans(prevPlans => [...prevPlans, joinedPlan]);
    }
    setSelectedPlan(joinedPlan);
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
        window.localStorage.setItem(getDailyCompletionKey(planId), 'true');
        setIsDailyTaskCompleted(true);
        handleNavigation('readingCompleted', true);
    }
  };
  
  const handleNavigateToVerse = (book: string, chapter: number, verse: number | null) => {
    setBibleNavTarget({ book, chapter, verse });
    handleNavigation('bible', true);
  };
  
  const startPlanReading = (plan: Plan, book: string, chapters: string) => {
    if (!plan.startDate) return;

    const { start, end } = parseChapterRange(chapters);
    setSelectedPlan(plan);
    setPlanReadingSession({
      planId: plan.id,
      book,
      startChapter: start,
      endChapter: end,
    });
    handleNavigateToVerse(book, start, 1);
  };

  const handleContinueReading = (book: string, chapters: string) => {
    if (!activePlan) return;
    startPlanReading(activePlan, book, chapters);
  };

  const handleDailyReadingComplete = () => {
    if (!planReadingSession) return;
    const { planId } = planReadingSession;
    setPlanReadingSession(null);
    handleCompleteReading(planId);
  };


  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomePage 
                  userProfile={{ ...profile, name: activeUserName }} 
                  activePlan={activePlan}
                  isDailyTaskCompleted={isDailyTaskCompleted}
                  onNavigateToPlan={() => handleNavigation('plan', true)}
                  onContinueReading={handleContinueReading}
                  onNavigateToAnnouncements={() => handleNavigation('announcements')}
                  onNavigateToDiscipleship={() => handleNavigation('discipleship')}
                  onNavigateToGiving={() => handleNavigation('giving')}
                />;
      case 'bible':
        return <BiblePage 
                    initialTarget={bibleNavTarget}
                    onNavigationHandled={() => setBibleNavTarget(null)}
                    planReadingSession={planReadingSession}
                    onDailyReadingComplete={handleDailyReadingComplete}
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
                                  onJoinPlan={handleJoinPlan}
                                  onStartReading={(book, chapters) => startPlanReading(selectedPlan, book, chapters)}
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
      case 'sermons':
        return <SermonLibraryPage 
                  onNavigateToTracker={() => handleNavigation('messageTracker')} 
                  onSelectSermon={(sermon) => {
                    setSelectedSermon(sermon);
                    handleNavigation('sermonDetail');
                  }}
               />;
      case 'sermonDetail':
        return selectedSermon && <SermonDetailPage 
                                    sermon={selectedSermon} 
                                    onNavigateBack={() => handleNavigation('sermons')} 
                                  />;
      case 'messageTracker':
        return <MessageTrackerPage onNavigateBack={() => handleNavigation('sermons')} />;
      case 'announcements':
        return <AnnouncementsPage onNavigateBack={() => handleNavigation('home')} />;
      case 'discipleship':
        return <DiscipleshipPage onNavigateBack={() => handleNavigation('home')} />;
      case 'giving':
        return <GivingPage onNavigateBack={() => handleNavigation('home')} />;
      default:
        return <HomePage 
                  userProfile={profile} 
                  activePlan={activePlan}
                  isDailyTaskCompleted={isDailyTaskCompleted}
                  onNavigateToPlan={() => handleNavigation('plan', true)}
                  onContinueReading={handleContinueReading}
                  onNavigateToAnnouncements={() => handleNavigation('announcements')}
                  onNavigateToDiscipleship={() => handleNavigation('discipleship')}
                  onNavigateToGiving={() => handleNavigation('giving')}
                />;
    }
  };
  
  const NavButton: React.FC<{ tab: 'home' | 'bible' | 'sermons' | 'plan' | 'settings'; label: string; icon: React.ReactNode }> = ({ tab, label, icon }) => {
    const isSettingsSubView = ['editProfile', 'notificationSettings', 'bookmarks'].includes(currentView);
    const isPlanSubView = ['planDetail', 'createPlan', 'calendar', 'readingCompleted'].includes(currentView);
    const isSermonSubView = ['messageTracker', 'sermonDetail'].includes(currentView);
    const isActive = currentView === tab || (tab === 'settings' && isSettingsSubView) || (tab === 'plan' && isPlanSubView) || (tab === 'sermons' && isSermonSubView);
    
    const activeClasses = 'text-brand-accent bg-brand-nav-active-bg font-bold shadow-xs';
    const inactiveClasses = 'text-brand-inactive hover:text-brand-dark';

    return (
        <button 
            onClick={() => handleNavigation(tab)}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-1.5 transition-all duration-200 cursor-pointer ${isActive ? activeClasses : inactiveClasses}`}
        >
            {icon}
            <span className="text-[11px] font-medium leading-none">{label}</span>
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
    'sermons',
    'sermonDetail',
    'messageTracker',
    'announcements',
    'discipleship',
    'giving',
    'readingCompleted',
    'bookmarks'
  ].includes(currentView);


  const { user } = useAuth();
  const activeUserName = user?.name || profile?.name || 'Disciple';

  return (
    <div className="bg-brand-bg min-h-screen max-w-md mx-auto flex flex-col">
      {!isHeaderHidden && currentView === 'home' ? (
          <header className="flex items-center justify-between px-6 pt-5 pb-2 shrink-0">
            <div className="flex items-center gap-2">
              {/* Brand name removed from header as user is already in the app */}
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={() => handleNavigation('announcements')}
                className="w-10 h-10 rounded-full bg-white border border-gray-200/80 shadow-xs flex items-center justify-center text-brand-dark hover:bg-gray-50 transition-colors cursor-pointer"
                aria-label="Announcements & Notifications"
                title="Notifications"
              >
                <NotificationIcon size={18} />
              </button>
              <button
                onClick={() => handleNavigation('settings')}
                className="w-10 h-10 rounded-full bg-white border border-gray-200/80 shadow-xs flex items-center justify-center text-brand-dark hover:bg-gray-50 transition-colors cursor-pointer"
                aria-label="Settings"
                title="Settings"
              >
                <SettingsIcon size={18} />
              </button>
              <button
                onClick={() => handleNavigation('editProfile')}
                className="w-10 h-10 rounded-full overflow-hidden border border-gray-200/80 shadow-xs flex items-center justify-center bg-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                aria-label="Profile Avatar"
                title="Profile"
              >
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={activeUserName} className="w-full h-full object-cover" />
                ) : (
                  <AvatarIcon size={20} className="text-brand-dark" />
                )}
              </button>
            </div>
          </header>
        ) : null}

      {currentView === 'home' && showBanner && activePlan && (
        <ReminderBanner
          planTitle={activePlan.title}
          onReadNow={() => {
            dismissBanner();
            if (todaysReading) {
              handleContinueReading(todaysReading.book, todaysReading.chapters);
            }
          }}
          onDismiss={dismissBanner}
        />
      )}

      {renderContent()}

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-brand-bg/95 backdrop-blur-sm border-t border-gray-200/80 z-30">
          <div className="flex justify-around items-center h-20 px-2">
              <NavButton tab="home" label="Home" icon={<HomeIcon size={20} />} />
              <NavButton tab="bible" label="Bible" icon={<BibleIcon size={20} />} />
              <NavButton tab="sermons" label="Sermons" icon={<MessageIcon className="w-5 h-5" />} />
              <NavButton tab="plan" label="Plan" icon={<PlanIcon size={20} />} />
              <NavButton tab="settings" label="Settings" icon={<SettingsIcon size={20} />} />
          </div>
        </footer>
    </div>
  );
};

export default MainApp;