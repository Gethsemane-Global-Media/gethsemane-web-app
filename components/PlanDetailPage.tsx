import React, { useMemo } from 'react';
import { Plan } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { BIBLE_CHAPTERS, NEW_TESTAMENT_BOOKS, OLD_TESTAMENT_BOOKS } from '../data/bibleBooks';

interface PlanDetailPageProps {
  plan: Plan;
  onNavigateBack: () => void;
  onNavigateToCalendar: () => void;
  onStartPlan: (plan: Plan) => void;
  onCompleteReading: (planId: string) => void;
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


const PlanDetailPage: React.FC<PlanDetailPageProps> = ({ plan, onNavigateBack, onNavigateToCalendar, onStartPlan, onCompleteReading }) => {
  const readingSchedule = useMemo(() => generateReadingSchedule(plan), [plan]);

  const formatDate = (date: Date) => {
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    return `${month}, day ${day}`;
  };

  if (!plan.startDate) {
    return (
      <>
        <header className="flex items-center justify-between p-6 h-20 shrink-0">
            <div className="flex items-center">
              <button onClick={onNavigateBack} className="text-brand-primary p-2 -ml-2">
                  <ArrowLeftIcon />
              </button>
              <div className="flex items-center ml-2">
                <span className="h-8 w-px bg-green-700 mr-2"></span>
                <span className="text-2xl font-medium tracking-wider text-brand-primary">GSOM</span>
              </div>
            </div>
          </header>
        <main className="flex-grow p-6 flex flex-col">
          <h1 className="text-4xl font-medium text-brand-dark">{plan.title}</h1>
          <p className="text-brand-secondary mt-4 leading-relaxed">
            {plan.longDescription}
          </p>

          <div className="mt-10 space-y-4">
              <div className="flex justify-between items-center text-brand-primary">
                  <span className="text-brand-secondary">Chapters per day</span>
                  <span>{plan.details.chaptersPerDay}</span>
              </div>
              <button onClick={onNavigateToCalendar} className="flex justify-between items-center w-full text-brand-green font-medium pt-2">
                  <span>View calendar</span>
                  <ChevronRightIcon />
              </button>
          </div>

          <section className="mt-10">
              <h2 className="text-xl font-medium text-brand-dark mb-4">Books Included ({plan.details.books.length})</h2>
              <div className="space-y-3">
                  {plan.details.books.map(book => (
                      <div key={book} className="flex justify-between items-center text-brand-primary bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                          <span className="font-medium">{book}</span>
                          <span className="text-sm text-brand-secondary">{BIBLE_CHAPTERS[book] || 0} chapters</span>
                      </div>
                  ))}
              </div>
          </section>

          <div className="mt-auto pt-8 pb-8">
              <button onClick={() => onStartPlan(plan)} className="w-full py-5 bg-brand-dark text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors">
                  Start Plan
              </button>
          </div>
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
  endDate.setDate(endDate.getDate() + durationInDays -1);

  const progressPercentage = Math.round((dayOfPlan / durationInDays) * 100);
  const testament = NEW_TESTAMENT_BOOKS.includes(book) ? 'New testament' : OLD_TESTAMENT_BOOKS.includes(book) ? 'Old testament' : '';

  return (
    <>
      <header className="flex items-center justify-between p-6 h-20 shrink-0">
        <div className="flex items-center">
            <button onClick={onNavigateBack} className="text-brand-primary p-2 -ml-2">
            <ArrowLeftIcon />
          </button>
          <div className="flex items-center ml-2">
            <span className="h-8 w-px bg-green-700 mr-2"></span>
            <span className="text-2xl font-medium tracking-wider text-brand-primary">GSOM</span>
          </div>
        </div>
      </header>
      <main className="flex-grow p-6 flex flex-col pb-24">
        <h1 className="text-4xl font-medium text-brand-dark">{plan.title}</h1>
        <p className="text-brand-secondary mt-4 leading-relaxed">
          {plan.longDescription}
        </p>

        <div className="mt-10 space-y-4">
            <div className="flex justify-between items-center text-brand-primary">
                <span className="text-brand-secondary">Present day</span>
                <span>{formatDate(today)}</span>
            </div>
            <div className="flex justify-between items-center text-brand-primary">
                <span className="text-brand-secondary">Ends</span>
                <span>{formatDate(endDate)}</span>
            </div>
            <div className="flex justify-between items-center text-brand-primary">
                <span className="text-brand-secondary">Percentage completed</span>
                <span>{plan.progress || 0}%</span>
            </div>
             <button onClick={onNavigateToCalendar} className="flex justify-between items-center w-full text-brand-green font-medium pt-2">
                <span>View calender</span>
                <ChevronRightIcon />
            </button>
        </div>

        <section className="mt-10">
            <h2 className="text-lg font-medium text-brand-primary">Today's task</h2>
            <div className="mt-3 bg-brand-dark p-5 rounded-2xl text-white shadow-lg">
              <div className="flex justify-between items-start">
                  <div>
                    <div className="inline-block bg-white/20 text-white/90 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      Day {dayOfPlan + 1}
                    </div>
                    {todaysReading ? (
                      <>
                        <p className="text-4xl font-bold">{book}</p>
                        <p className="text-4xl font-bold">{chapters}</p>
                        <p className="text-sm text-gray-300 mt-2">{testament}</p>
                      </>
                    ) : (
                      <p className="text-2xl font-bold">Plan completed!</p>
                    )}
                  </div>
                  <button 
                    onClick={() => onCompleteReading(plan.id)}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-dark shrink-0"
                    aria-label="Complete today's reading"
                  >
                    <ArrowRightIcon />
                  </button>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <div className="flex-grow bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: `${plan.progress || 0}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-200 w-10 text-right">{plan.progress || 0}%</span>
              </div>
            </div>
        </section>
      </main>
    </>
  );
};

export default PlanDetailPage;
