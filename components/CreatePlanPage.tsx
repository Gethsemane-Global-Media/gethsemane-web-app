import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS } from '../data/bibleBooks';

interface CreatePlanPageProps {
  onNavigateBack: () => void;
  onAddPlan: (planData: { title: string; description: string; chaptersPerDay: number; books: string[] }) => void;
  setIsDirty: (isDirty: boolean) => void;
}

const BookList: React.FC<{ books: string[], selectedBooks: string[], onToggle: (book: string) => void }> = ({ books, selectedBooks, onToggle }) => (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {books.map(book => (
            <div key={book} className="flex items-center">
                <input
                    type="checkbox"
                    id={`book-${book.replace(/\s/g, '-')}`}
                    checked={selectedBooks.includes(book)}
                    onChange={() => onToggle(book)}
                    className="w-5 h-5 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                />
                <label htmlFor={`book-${book.replace(/\s/g, '-')}`} className="ml-3 text-brand-primary">
                    {book}
                </label>
            </div>
        ))}
    </div>
);

const TestamentSelection: React.FC<{
    title: string;
    books: string[];
    selectedBooks: string[];
    onToggleBook: (book: string) => void;
    onSelectAll: () => void;
}> = ({ title, books, selectedBooks, onToggleBook, onSelectAll }) => (
    <section className="mt-10">
        <h2 className="text-2xl font-bold text-brand-dark">{title}</h2>
        <div className="mt-4 space-y-4">
            <div className="flex items-center pb-2 border-b border-gray-200">
                <input
                    type="checkbox"
                    id={`select-all-${title.toLowerCase().replace(' ', '-')}`}
                    // Check if all books in this testament are selected
                    checked={books.every(book => selectedBooks.includes(book))}
                    onChange={onSelectAll}
                    className="w-5 h-5 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                />
                <label htmlFor={`select-all-${title.toLowerCase().replace(' ', '-')}`} className="ml-3 font-medium text-brand-primary">
                    Select All
                </label>
            </div>
            <BookList books={books} selectedBooks={selectedBooks} onToggle={onToggleBook} />
        </div>
    </section>
);


const ProgressStep: React.FC<{ number: number; label: string; isActive: boolean; isCompleted: boolean }> = ({ number, label, isActive, isCompleted }) => {
    const circleClasses = isCompleted ? 'bg-brand-green text-white' : isActive ? 'border-2 border-brand-green text-brand-green' : 'border-2 border-gray-300 text-gray-400';
    const textClasses = isActive || isCompleted ? 'text-brand-dark font-semibold' : 'text-brand-secondary';

    return (
        <div className="flex flex-col items-center w-24">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${circleClasses}`}>
                {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                ) : number}
            </div>
            <p className={`mt-2 text-sm text-center ${textClasses}`}>{label}</p>
        </div>
    );
};

const ProgressIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => (
    <div className="flex justify-between items-start my-10 relative px-10">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-[calc(100%-10rem)] h-0.5 bg-gray-300"></div>
        <div 
            className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-[calc(100%-10rem)] h-0.5 bg-brand-green transition-all duration-300" 
            style={{ transform: `scaleX(${currentStep === 1 ? 0 : 1})`, transformOrigin: 'left' }}
        ></div>
        <div className="z-10 bg-brand-bg">
            <ProgressStep number={1} label="Plan Details" isActive={currentStep === 1} isCompleted={currentStep > 1} />
        </div>
        <div className="z-10 bg-brand-bg">
            <ProgressStep number={2} label="Book Selection" isActive={currentStep === 2} isCompleted={currentStep > 2} />
        </div>
    </div>
);


const CreatePlanPage: React.FC<CreatePlanPageProps> = ({ onNavigateBack, onAddPlan, setIsDirty }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [chaptersPerDay, setChaptersPerDay] = useState('');
    const [selectedBooks, setSelectedBooks] = useState<string[]>([]);

    const isStep1Valid = title && chaptersPerDay && parseInt(chaptersPerDay) > 0;
    const isFormValid = isStep1Valid && selectedBooks.length > 0;
    const isDirty = title !== '' || description !== '' || chaptersPerDay !== '' || selectedBooks.length > 0;

    useEffect(() => {
        setIsDirty(isDirty);
    }, [isDirty, setIsDirty]);

    const handleBack = () => {
        if (currentStep === 2) {
            setCurrentStep(1);
        } else {
            onNavigateBack();
        }
    };

    const handleCreateClick = () => {
        if (!isFormValid) return;

        onAddPlan({
            title,
            description,
            chaptersPerDay: parseInt(chaptersPerDay),
            books: selectedBooks,
        });
    };

    const handleToggleBook = (book: string) => {
        setSelectedBooks(prev =>
            prev.includes(book)
                ? prev.filter(b => b !== book)
                : [...prev, book]
        );
    };

    const handleSelectAll = (testamentBooks: string[]) => {
        const allSelected = testamentBooks.every(book => selectedBooks.includes(book));
        if (allSelected) {
            // Deselect all from this testament
            setSelectedBooks(prev => prev.filter(b => !testamentBooks.includes(b)));
        } else {
            // Select all from this testament
            setSelectedBooks(prev => [...new Set([...prev, ...testamentBooks])]);
        }
    };


    return (
        <div className="bg-brand-bg min-h-screen max-w-md mx-auto flex flex-col">
            <header className="flex items-center h-16 shrink-0 px-6">
                <button onClick={handleBack} className="text-brand-primary p-2 -ml-2">
                    <ArrowLeftIcon />
                </button>
                <div className="flex-grow flex items-center ml-2">
                    <span className="h-8 w-px bg-green-700 mr-2"></span>
                    <span className="text-2xl font-medium tracking-wider text-brand-primary">GSOM</span>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto pb-8 px-6">
                 <div className="pt-4">
                    <h1 className="text-4xl font-medium text-brand-primary">Create plans</h1>
                    <p className="text-brand-secondary mt-4 mb-2">
                        Welcome, here you can create your own special plan and follow through as guided by the HOLY spirit.
                    </p>

                    <ProgressIndicator currentStep={currentStep} />
                    
                    {currentStep === 1 && (
                        <>
                             <form className="space-y-6">
                                <div>
                                    <label htmlFor="plan-title" className="text-sm text-brand-primary font-medium">Plan title</label>
                                    <input
                                        id="plan-title"
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter a title"
                                        className="w-full p-4 mt-1 bg-white rounded-2xl border-transparent focus:outline-none focus:ring-2 focus:ring-brand-accent placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="plan-description" className="text-sm text-brand-primary font-medium">Description</label>
                                    <input
                                        id="plan-description"
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="a short description of the plan"
                                        className="w-full p-4 mt-1 bg-white rounded-2xl border-transparent focus:outline-none focus:ring-2 focus:ring-brand-accent placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="chapters-per-day" className="text-sm text-brand-primary font-medium">Chapters per day</label>
                                    <input
                                        id="chapters-per-day"
                                        type="number"
                                        value={chaptersPerDay}
                                        onChange={(e) => setChaptersPerDay(e.target.value)}
                                        placeholder="e.g., 3"
                                        className="w-full p-4 mt-1 bg-white rounded-2xl border-transparent focus:outline-none focus:ring-2 focus:ring-brand-accent placeholder-gray-400"
                                    />
                                </div>
                            </form>
                            <section className="mt-12">
                                <button 
                                    onClick={() => setCurrentStep(2)}
                                    disabled={!isStep1Valid}
                                    className="w-full py-5 bg-brand-dark text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    Next
                                </button>
                            </section>
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                             <TestamentSelection
                                title="Old Testament"
                                books={OLD_TESTAMENT_BOOKS}
                                selectedBooks={selectedBooks}
                                onToggleBook={handleToggleBook}
                                onSelectAll={() => handleSelectAll(OLD_TESTAMENT_BOOKS)}
                            />

                            <TestamentSelection
                                title="New Testament"
                                books={NEW_TESTAMENT_BOOKS}
                                selectedBooks={selectedBooks}
                                onToggleBook={handleToggleBook}
                                onSelectAll={() => handleSelectAll(NEW_TESTAMENT_BOOKS)}
                            />
                            
                            <section className="mt-12">
                                <button 
                                    onClick={handleCreateClick}
                                    disabled={!isFormValid}
                                    className="w-full py-5 bg-brand-dark text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    Create Plan
                                </button>
                            </section>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CreatePlanPage;