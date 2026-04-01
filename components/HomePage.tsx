import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile } from '../hooks/useUserProfile';
import { Plan } from '../types';
import { BIBLE_CHAPTERS } from '../data/bibleBooks';
import { CalendarIcon } from './icons/CalendarIcon';
import { RefreshIcon } from './icons/RefreshIcon';

interface HomePageProps {
  userProfile: UserProfile;
  activePlan: Plan | null;
  onNavigateToPlan: () => void;
  onContinueReading: (book: string, chapter: number) => void;
}

// This helper function calculates the reading schedule for a given plan.
const generateReadingSchedule = (plan: Plan): string[] => {
    const schedule: string[] = [];
    if (!plan.details.books) return [];
    let currentChapter = 1, currentBookIndex = 0, chaptersReadInDay = 0, dailyReading = '';
    while (currentBookIndex < plan.details.books.length) {
        const bookName = plan.details.books[currentBookIndex];
        const totalChapters = BIBLE_CHAPTERS[bookName] || 0;
        if (currentChapter > totalChapters) {
            currentBookIndex++; currentChapter = 1; continue;
        }
        const chaptersLeftInBook = totalChapters - currentChapter + 1;
        const chaptersToReadInBook = Math.min(chaptersLeftInBook, plan.details.chaptersPerDay - chaptersReadInDay);
        const startChapter = currentChapter, endChapter = currentChapter + chaptersToReadInBook - 1;
        if (dailyReading) dailyReading += '; ';
        dailyReading += `${bookName} ${startChapter}${endChapter > startChapter ? `-${endChapter}` : ''}`;
        chaptersReadInDay += chaptersToReadInBook;
        currentChapter = endChapter + 1;
        if (chaptersReadInDay >= plan.details.chaptersPerDay) {
            schedule.push(dailyReading); dailyReading = ''; chaptersReadInDay = 0;
        }
        if (currentChapter > totalChapters) {
            currentBookIndex++; currentChapter = 1;
        }
    }
    if (dailyReading) schedule.push(dailyReading);
    return schedule;
};

const HomePage: React.FC<HomePageProps> = ({ userProfile, activePlan, onNavigateToPlan, onContinueReading }) => {
  const [bibleFact, setBibleFact] = useState<string>('');
  const [isLoadingFact, setIsLoadingFact] = useState(true);
  const [currentTip, setCurrentTip] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const currentDate = useMemo(() => new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }), []);

  useEffect(() => {
    const fetchBibleFact = async () => {
        try {
            setIsLoadingFact(true);
            const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
            
            if (!apiKey) {
                console.warn('OpenRouter API key not found, using fallback fact');
                setBibleFact("The word KOINONIA means fellowship and it connotes intimacy and communion.");
                return;
            }
            
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://your-app-url.com', // Replace with your actual app URL
                    'X-Title': 'GSOM Bible App',
                },
                body: JSON.stringify({
                    model: 'openai/gpt-3.5-turbo', // or another model available on OpenRouter
                    messages: [
                        {
                            role: 'user',
                            content: 'Tell me an interesting, little-known fact about the Bible in one concise sentence, suitable for a "Did you know?" section in an app. For example, "The word KOINONIA means fellowship and it connotes intimacy and communion."'
                        }
                    ],
                    max_tokens: 100,
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.statusText}`);
            }

            const data = await response.json();
            const fact = data.choices?.[0]?.message?.content || "The word KOINONIA means fellowship and it connotes intimacy and communion.";
            setBibleFact(fact);
        } catch (error) {
            console.error("Failed to fetch Bible fact:", error);
            setBibleFact("The word KOINONIA means fellowship and it connotes intimacy and communion."); // Fallback fact
        } finally {
            setIsLoadingFact(false);
        }
    };
    fetchBibleFact();
  }, []);

  // Tips carousel slides; ensure at least 3 slides for pagination feel
  const tips = useMemo(() => {
    const base = bibleFact ? [bibleFact] : [];
    // Fill up to 3 slides by repeating the fact if needed
    const filled = [...base];
    while (filled.length < 3) filled.push(base[0] || 'The word KOINONIA means fellowship and it connotes intimacy and communion.');
    return filled.slice(0, 3);
  }, [bibleFact]);

  const minSwipeDistance = 50;
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setIsDragging(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || !isDragging) return;
    const currentX = e.targetTouches[0].clientX;
    setDragOffset(currentX - touchStartX);
  };
  const handleTouchEnd = () => {
    if (!isDragging || touchStartX === null) return;
    setIsDragging(false);
    if (dragOffset < -minSwipeDistance && currentTip < tips.length - 1) {
      setCurrentTip(currentTip + 1);
    } else if (dragOffset > minSwipeDistance && currentTip > 0) {
      setCurrentTip(currentTip - 1);
    }
    setDragOffset(0);
    setTouchStartX(null);
  };

  const planDetails = useMemo(() => {
    if (!activePlan || !activePlan.startDate) return null;

    const schedule = generateReadingSchedule(activePlan);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const planStartDate = new Date(activePlan.startDate);
    planStartDate.setHours(0, 0, 0, 0);

    const dayOfPlan = Math.floor((today.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const todaysReading = dayOfPlan >= 0 && dayOfPlan < schedule.length ? schedule[dayOfPlan] : null;
    
    let book = '', chapters = '';
    if (todaysReading) {
      const firstReading = todaysReading.split('; ')[0];
      const parts = firstReading.split(' ');
      book = parts.slice(0, -1).join(' ');
      chapters = parts[parts.length - 1];
    }
    
    return {
      dayOfPlan: dayOfPlan + 1,
      progress: activePlan.progress || 0,
      todaysReading,
      book,
      chapters
    };
  }, [activePlan]);
  
  const firstName = userProfile.name.split(' ')[0];

  return (
    <main className="flex-grow p-6 pt-2 overflow-y-auto">
      {activePlan && planDetails && planDetails.todaysReading ? (
        <>
          <section className="mt-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div className="text-brand-dark">
                  <h2 className="text-3xl">{activePlan.title}</h2>
              </div>
              <div className="text-right shrink-0 ml-4">
                  <p className="text-sm text-brand-secondary">{currentDate}</p>
                  <h2 className="text-4xl font-bold mt-1 leading-tight">{planDetails.book}</h2>
                  <p className="text-4xl font-bold leading-tight">{planDetails.chapters}</p>
              </div>
            </div>
            <button
                onClick={() => onContinueReading(planDetails.book, parseInt(planDetails.chapters.split('-')[0], 10))}
                className="w-full mt-4 py-3 bg-brand-dark text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors"
            >
                Continue
            </button>
            <div className="flex justify-between items-center mt-4 text-brand-secondary text-sm px-2">
              <div className="flex items-center gap-2">
                  <CalendarIcon />
                  <span>Day {planDetails.dayOfPlan}</span>
              </div>
              <div className="flex items-center gap-2">
                  <RefreshIcon />
                  <span>{planDetails.progress}% done</span>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <h3 className="text-2xl font-bold text-brand-dark">Do you know!</h3>
            <div 
              className="relative mt-4 bg-white rounded-2xl shadow-sm min-h-[96px] border border-gray-100 overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {isLoadingFact ? (
                <div className="p-6 animate-pulse flex space-x-4 w-full">
                    <div className="flex-1 space-y-3 py-1">
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                        <div className="h-2 bg-gray-200 rounded col-span-1"></div>
                      </div>
                    </div>
                  </div>
              ) : (
                tips.map((tip, index) => (
                  <div
                    key={index}
                    className="absolute inset-0 p-6 flex items-center"
                    style={{
                      transform: `translateX(calc(${(index - currentTip) * 100}% + ${dragOffset}px))`,
                      transition: isDragging ? 'none' : 'transform 0.4s ease-in-out',
                    }}
                  >
                    <p className="text-brand-primary leading-relaxed">{tip}</p>
                  </div>
                ))
              )}
            </div>
             <div className="flex justify-center items-center gap-2 mt-4">
              {tips.map((_, i) => (
                <div key={i} className={`${i === currentTip ? 'w-4 h-2 bg-brand-dark' : 'w-2 h-2 bg-gray-300'} rounded-full`}></div>
              ))}
            </div>
          </section>

          <section className="mt-8 pb-24">
            <h3 className="text-lg font-medium text-brand-primary">Today's task</h3>
            <div className="mt-3 bg-brand-green p-5 rounded-2xl text-white shadow-lg">
              <div className="inline-block bg-brand-orange text-white text-xs font-semibold px-3 py-1 rounded-full mb-2">
                Day {planDetails.dayOfPlan}
              </div>
              <p className="text-4xl font-bold">{planDetails.book}</p>
            </div>
          </section>
        </>
      ) : (
         <>
          <section>
            <div className="text-brand-primary pt-10">
                <h1 className="text-2xl">Hello, {firstName}</h1>
                <p className="text-2xl">{activePlan ? activePlan.title : 'Welcome!'}</p>
            </div>
           </section>
           
           <section className="mt-10">
              <h3 className="text-2xl font-bold text-brand-dark">Do you know!</h3>
              <div className="mt-4 bg-white p-6 rounded-2xl shadow-sm min-h-[96px] flex items-center">
                {isLoadingFact ? (
                  <div className="animate-pulse flex space-x-4 w-full">
                      <div className="flex-1 space-y-3 py-1">
                        <div className="h-2 bg-gray-200 rounded"></div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                          <div className="h-2 bg-gray-200 rounded col-span-1"></div>
                        </div>
                      </div>
                    </div>
                ) : (
                  <p className="text-brand-primary leading-relaxed">{bibleFact}</p>
                )}
              </div>
            </section>
            
            <section className="mt-8 pb-24">
              <h3 className="text-lg font-medium text-brand-primary">Today's task</h3>
              <div className="mt-3 bg-white p-5 rounded-2xl text-brand-dark shadow-sm text-center">
                <p className="font-medium">{activePlan ? "You've completed this plan!" : "No active plan."}</p>
                <p className="text-sm text-brand-secondary mt-1">{activePlan ? "Great job!" : "Start a new plan to see your daily tasks here."}</p>
                <button onClick={onNavigateToPlan} className="mt-4 px-6 py-2 bg-brand-dark text-white rounded-full font-semibold text-sm hover:bg-opacity-90 transition-colors">
                    {activePlan ? "Choose a New Plan" : "Explore Plans"}
                </button>
              </div>
            </section>
        </>
      )}
    </main>
  );
};

export default HomePage;