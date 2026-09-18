import React, { useState, TouchEvent } from 'react';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface OnboardingPageProps {
  onOnboardingComplete: () => void;
}

const publicAsset = (name: string) => `${import.meta.env.BASE_URL}${name}`;

const slides = [
  {
    // Local asset for the first onboarding screen. Place the PNG at public/onboarding-1.png
    image: publicAsset('onboarding-1.png'),
    subtitle: 'Get started',
    title: 'Bible Plans',
    description: 'Finally you can study the Bible in a constructive and proficient manner. the plans feature allows you to study the Bible within a fixed time frame.',
  },
  {
    // Local asset for the second onboarding screen. Place the PNG at public/onboarding-2.png
    image: publicAsset('onboarding-2.png'),
    subtitle: 'Get started',
    title: 'Set Routine',
    description: 'The ability to set a special time to fellowship with the WORD',
  },
  {
    // Local asset for the third onboarding screen. Place the PNG at public/onboarding-3.png
    image: publicAsset('onboarding-3.png'),
    subtitle: 'Get started',
    title: 'Listen on the go',
    description: 'With the audio feature, you could listen to the WORD while you go on with your daily activity.',
  },
];


const OnboardingPage: React.FC<OnboardingPageProps> = ({ onOnboardingComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStartX || !isDragging) return;
    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - touchStartX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging || touchStartX === null) return;

    setIsDragging(false);
    
    // Negative dragOffset means swiping left
    if (dragOffset < -minSwipeDistance && currentStep < slides.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (dragOffset > minSwipeDistance && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }

    // Reset for the next drag
    setDragOffset(0);
    setTouchStartX(null);
  };
  
  return (
    <div 
      className="bg-brand-bg min-h-screen max-w-md mx-auto flex flex-col relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
        {slides.map((slide, index) => (
             <div
                key={index}
                className={`absolute inset-0 bg-no-repeat ${index === 0 ? 'bg-right-bottom bg-contain' : index === 1 ? 'bg-right-bottom bg-cover' : 'bg-right-top bg-cover'}`}
                style={{
                    backgroundImage: `url(${slide.image})`,
                    transform: `translateX(calc(${(index - currentStep) * 100}% + ${dragOffset}px))`,
                    transition: isDragging ? 'none' : 'transform 0.5s ease-in-out',
                    zIndex: 0,
                }}
            />
        ))}
       <div 
        className="absolute inset-0" 
        style={{
            background: 'linear-gradient(to bottom, #F8F6F1 40%, rgba(248, 246, 241, 0.2) 70%, rgba(248, 246, 241, 0) 100%)',
            zIndex: 1,
        }}
        ></div>

      <div className="relative z-10 flex flex-col flex-grow h-full">
        <header className="h-16 shrink-0 px-6">
        </header>

        <div className="flex-grow flex relative overflow-hidden">
             {slides.map((slide, index) => (
                <main 
                    key={index}
                    className="absolute inset-0 flex flex-col justify-center items-start text-left px-8 -mt-32"
                    style={{ 
                        transform: `translateX(calc(${(index - currentStep) * 100}% + ${dragOffset}px))`,
                        transition: isDragging ? 'none' : 'transform 0.5s ease-in-out'
                    }}
                >
                    <p className="text-brand-primary text-lg">{slide.subtitle}</p>
                    <h1 className="text-5xl font-bold text-brand-dark mt-4">{slide.title}</h1>
                    <p className="text-brand-secondary mt-6 leading-relaxed max-w-xs">
                        {slide.description}
                    </p>
                </main>
            ))}
        </div>

        {/* Design System Spec Section 4.3: Pagination / Step Indicator */}
        <footer className="h-20 flex items-center justify-start gap-2 z-10 px-8 pb-4">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`transition-all duration-300 rounded-pill h-2 ${
                currentStep === index ? 'w-6 bg-brand-dark' : 'w-2 bg-brand-neutral/30'
              }`}
            />
          ))}
        </footer>
      </div>

       {currentStep === slides.length - 1 && (
            <button
            onClick={onOnboardingComplete}
            className="absolute bottom-16 right-8 w-16 h-16 bg-brand-dark text-white rounded-full flex items-center justify-center z-20 shadow-lg"
            aria-label="Get Started"
            >
                <ArrowRightIcon />
            </button>
        )}
    </div>
  );
};

export default OnboardingPage;
