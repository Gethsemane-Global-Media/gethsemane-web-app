import React, { useMemo } from 'react';
import { Plan } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { BIBLE_CHAPTERS, NEW_TESTAMENT_BOOKS, OLD_TESTAMENT_BOOKS } from '../data/bibleBooks';

const formatChapterRange = (chapters: string) => chapters.replace('-', ' - ');

const CircularProgress: React.FC<{ percent: number }> = ({ percent }) => {
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width="22" height="22" viewBox="0 0 22 22" className="shrink-0" aria-hidden="true">
      <circle cx="11" cy="11" r={radius} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
      <circle
        cx="11"
        cy="11"
        r={radius}
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 11 11)"
      />
    </svg>
  );
};

const PlanDetailHeader: React.FC<{ onNavigateBack: () => void }> = ({ onNavigateBack }) => (
  <header className="shrink-0 px-6 pt-4 pb-2">
    <button
      onClick={onNavigateBack}
      className="text-brand-primary p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
      aria-label="Go back"
    >
      <ChevronLeftIcon size={28} />
    </button>
  </header>
);

interface PlanDetailPageProps {
  plan: Plan;
  onNavigateBack: () => void;
  onNavigateToCalendar: () => void;
  onStartPlan: (plan: Plan) => void;
  onStartReading: (book: string, chapters: string) => void;
  onJoinPlan?: (plan: Plan) => void;
}

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


const PlanDetailPage: React.FC<PlanDetailPageProps> = ({ plan, onNavigateBack, onNavigateToCalendar, onStartPlan, onStartReading, onJoinPlan }) => {
  const readingSchedule = useMemo(() => generateReadingSchedule(plan), [plan]);

  const formatDate = (date: Date) => {
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    return `${month}, day ${day}`;
  };

  const isCommunity = plan.type === 'community';
  const formatParticipantCount = (count: number) =>
    count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);

  if (!plan.startDate) {
    return (
      <>
        <PlanDetailHeader onNavigateBack={onNavigateBack} />

        <main className="flex-grow flex flex-col px-6 pb-28">
          {isCommunity && (
            <div className="inline-flex items-center gap-1.5 self-start bg-brand-neutral/10 text-brand-neutral text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Community plan
            </div>
          )}

          <h1 className="text-3xl font-bold text-brand-dark leading-tight">{plan.title}</h1>

          {isCommunity && plan.participantCount !== undefined && (
            <p className="text-brand-secondary mt-2 text-sm">
              <span className="font-semibold text-brand-dark">{formatParticipantCount(plan.participantCount)}</span> people are reading this plan
            </p>
          )}

          <p className="text-brand-secondary mt-4 text-[15px] leading-relaxed">
            {plan.longDescription}
          </p>

          <div className="mt-10 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-brand-secondary">Duration</span>
              <span className="text-brand-dark font-medium">{plan.details.duration}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-brand-secondary">Chapters per day</span>
              <span className="text-brand-dark font-medium">{plan.details.chaptersPerDay}</span>
            </div>
            <button
              onClick={onNavigateToCalendar}
              className="flex justify-between items-center w-full text-brand-green font-medium pt-1"
            >
              <span>View calendar</span>
              <ChevronRightIcon className="text-brand-green" />
            </button>
          </div>

          <div className="flex-grow min-h-[8rem]" />

          <button
            onClick={() => isCommunity && onJoinPlan ? onJoinPlan(plan) : onStartPlan(plan)}
            className="w-full py-5 bg-brand-dark text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors mb-4"
          >
            {isCommunity ? 'Join Plan' : 'Start Plan'}
          </button>
        </main>
      </>
    );
  }

  // Active Plan View
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const planStartDate = new Date(plan.startDate);
  planStartDate.setHours(0, 0, 0, 0);

  const dayOfPlan = Math.floor((today.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const todaysReading = dayOfPlan >= 0 && dayOfPlan < readingSchedule.length ? readingSchedule[dayOfPlan] : null;

  let book = '';
  let chapters = '';
  if (todaysReading) {
      const readingParts = todaysReading.split('; ');
      const firstReading = readingParts[0];
      const parts = firstReading.split(' ');
      book = parts.slice(0, -1).join(' ');
      chapters = parts[parts.length - 1];
  }

  const durationInDays = readingSchedule.length;
  const endDate = new Date(planStartDate);
  endDate.setDate(endDate.getDate() + durationInDays - 1);

  const progress = plan.progress || 0;
  const testament = NEW_TESTAMENT_BOOKS.includes(book)
    ? 'New testament'
    : OLD_TESTAMENT_BOOKS.includes(book)
      ? 'Old testament'
      : '';

  return (
    <>
      <PlanDetailHeader onNavigateBack={onNavigateBack} />

      <main className="flex-grow flex flex-col px-6 pb-28">
        <h1 className="text-3xl font-bold text-brand-dark leading-tight">{plan.title}</h1>
        <p className="text-brand-secondary mt-4 text-[15px] leading-relaxed">
          {plan.longDescription}
        </p>

        <div className="mt-10 space-y-5">
          <div className="flex justify-between items-center">
            <span className="text-brand-secondary">Present day</span>
            <span className="text-brand-dark font-medium">{formatDate(today)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-brand-secondary">Ends</span>
            <span className="text-brand-dark font-medium">{formatDate(endDate)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-brand-secondary">Percentage completed</span>
            <span className="text-brand-dark font-medium">{progress}%</span>
          </div>
          <button
            onClick={onNavigateToCalendar}
            className="flex justify-between items-center w-full text-brand-green font-medium pt-1"
          >
            <span>View calendar</span>
            <ChevronRightIcon className="text-brand-green" />
          </button>
        </div>

        <section className="mt-10">
          <h2 className="text-base font-medium text-brand-accent">Today&apos;s task</h2>
          <div className="mt-3 bg-brand-primary p-5 rounded-card-lg text-white min-h-[200px] flex flex-col">
            {todaysReading ? (
              <>
                <div className="inline-block self-start bg-brand-accent text-white text-xs font-semibold px-3 py-1 rounded-pill">
                  Day {dayOfPlan + 1}
                </div>
                <p className="text-3xl font-bold mt-4 leading-tight">{book}</p>
                <p className="text-3xl font-bold leading-tight">{formatChapterRange(chapters)}</p>

                <div className="flex justify-between items-end mt-auto pt-8">
                  <div>
                    <p className="text-sm text-gray-300">{testament}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <CircularProgress percent={progress} />
                      <span className="text-sm font-medium">{progress}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onStartReading(book, chapters)}
                    className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-white shrink-0 hover:bg-white/10 transition-colors"
                    aria-label="Start today's reading"
                  >
                    <ArrowRightIcon size={22} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center flex-grow">
                <p className="text-2xl font-bold">Plan completed!</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default PlanDetailPage;
