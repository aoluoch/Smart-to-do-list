import React, { useState, useEffect, useRef } from 'react';
import { LandingNavbar } from './LandingNavbar';
import { HomePage } from '@/pages/landing/HomePage';
import { FeaturesPage } from '@/pages/landing/FeaturesPage';
import { HowItWorksPage } from '@/pages/landing/HowItWorksPage';
import { BenefitsPage } from '@/pages/landing/BenefitsPage';
import { GetStartedPage } from '@/pages/landing/GetStartedPage';
import { motion, AnimatePresence } from 'framer-motion';

export type LandingPageType = 'home' | 'features' | 'how-it-works' | 'benefits' | 'get-started';

interface LandingLayoutProps {
  initialPage?: LandingPageType;
}

export const LandingLayout: React.FC<LandingLayoutProps> = ({ initialPage = 'home' }) => {
  const [currentPage, setCurrentPage] = useState<LandingPageType>(initialPage);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const pages: LandingPageType[] = ['home', 'features', 'how-it-works', 'benefits', 'get-started'];

  // Handle scroll to change pages
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling) return;

      const currentIndex = pages.indexOf(currentPage);

      if (e.deltaY > 0) {
        // Scroll down - go to next page or allow natural scroll on last page
        if (currentIndex < pages.length - 1) {
          setIsScrolling(true);
          setCurrentPage(pages[currentIndex + 1]);

          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }
          scrollTimeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
          }, 800);
        }
        // If on last page, allow natural scrolling (don't prevent default)
      } else if (e.deltaY < 0 && currentIndex > 0) {
        // Scroll up - go to previous page
        setIsScrolling(true);
        setCurrentPage(pages[currentIndex - 1]);

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 800);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentPage, isScrolling, pages]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'features':
        return <FeaturesPage />;
      case 'how-it-works':
        return <HowItWorksPage />;
      case 'benefits':
        return <BenefitsPage />;
      case 'get-started':
        return <GetStartedPage />;
      default:
        return <HomePage />;
    }
  };

  const pageVariants = {
    initial: { 
      opacity: 0, 
      x: 100,
      scale: 0.95
    },
    in: { 
      opacity: 1, 
      x: 0,
      scale: 1
    },
    out: { 
      opacity: 0, 
      x: -100,
      scale: 0.95
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.8
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="w-full"
        >
          {renderCurrentPage()}
        </motion.div>
      </AnimatePresence>


    </div>
  );
};
