import React, { useState, useMemo } from 'react';
import { Plan } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { BIBLE_CHAPTERS } from '../data/bibleBooks';

interface CalendarPageProps {
  plan: Plan;
  onNavigateBack: () => void;
}

const generateReadingSchedule = (plan: Plan): string[] => {
    const schedule: string[] = [];
    if (!plan.details.books) return [];

    let currentChapter = 1;
    let currentBookIndex = 0;

    while (currentBookIndex < plan.details.books.length) {
        const bookName = plan.details.books[currentBookIndex];
        const totalChapters = BIBLE_CHAPTERS[bookName] || 0;
        
        const startChapter = currentChapter;
        const endChapter = Math.min(totalChapters, startChapter + plan.details.chaptersPerDay - 1);
        
        if (startChapter > totalChapters) {
             currentBookIndex++;
             currentChapter = 1;
             continue;
        }

        let reading = `${bookName} ${startChapter}`;
        if (endChapter > startChapter) {
            reading += `-${endChapter}`;
        }
        schedule.push(reading);

        if (endChapter >= totalChapters) {
            currentBookIndex++;
            currentChapter = 1;
        } else {
            currentChapter = endChapter + 1;
        }
    }
    return schedule;
};

const CalendarPage: React.FC<CalendarPageProps> = ({ plan, onNavigateBack }) => {
    const today = useMemo(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }, []);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(today);

    const readingSchedule = useMemo(() => generateReadingSchedule(plan), [plan]);

    const changeMonth = (amount: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    };

    const getReadingForDate = (date: Date) => {
        const planStartDate = new Date(today); // Assume plan starts today for this demo
        const diffTime = date.getTime() - planStartDate.getTime();
        if (diffTime < 0) return null;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return readingSchedule[diffDays] || null;
    }

    const renderCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.getTime() === today.getTime();
            const isSelected = date.getTime() === selectedDate.getTime();
            const reading = getReadingForDate(date);

            const baseClasses = "w-10 h-10 flex items-center justify-center rounded-full transition-colors text-sm relative";
            let dayClasses = 'cursor-pointer';

            if (isSelected) {
                dayClasses += ' bg-brand-dark text-white';
            } else if (isToday) {
                dayClasses += ' bg-brand-accent text-white';
            } else {
                dayClasses += ' hover:bg-gray-200 text-brand-primary';
            }
            
            days.push(
                <div key={day} className={`${baseClasses} ${dayClasses}`} onClick={() => setSelectedDate(date)}>
                    {day}
                    {reading && <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected || isToday ? 'bg-white' : 'bg-brand-green'}`}></span>}
                </div>
            );
        }
        return days;
    };

    const selectedReading = getReadingForDate(selectedDate);

    return (
        <div className="bg-brand-bg min-h-screen max-w-md mx-auto flex flex-col p-6">
            <header className="flex items-center h-16 shrink-0 -ml-2">
                <button onClick={onNavigateBack} className="text-brand-primary p-2">
                    <ArrowLeftIcon />
                </button>
                <div className="flex-grow text-center">
                    <h1 className="text-xl font-semibold text-brand-primary">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={() => changeMonth(-1)} className="text-brand-primary p-2 transform rotate-180"><ChevronRightIcon /></button>
                   <button onClick={() => changeMonth(1)} className="text-brand-primary p-2"><ChevronRightIcon /></button>
                </div>
            </header>
            <main className="flex-grow flex flex-col mt-4">
                <div className="grid grid-cols-7 gap-y-2 text-center text-brand-secondary text-sm">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-y-4 justify-items-center mt-4">
                    {renderCalendarGrid()}
                </div>

                <div className="mt-auto pb-4 pt-8">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-sm text-brand-secondary">{selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        {selectedReading ? (
                             <p className="text-2xl font-bold text-brand-dark mt-1">{selectedReading}</p>
                        ) : (
                             <p className="text-lg text-brand-primary mt-1">No reading scheduled.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CalendarPage;