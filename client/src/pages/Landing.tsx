import React from 'react';
import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { HomePage } from '@/pages/landing/HomePage';
import { FeaturesPage } from '@/pages/landing/FeaturesPage';
import { HowItWorksPage } from '@/pages/landing/HowItWorksPage';
import { BenefitsPage } from '@/pages/landing/BenefitsPage';
import { GetStartedPage } from '@/pages/landing/GetStartedPage';

export const Landing: React.FC = () => {
  return (
    <div className="bg-background">
      <LandingNavbar />

      {/* All sections in a continuous scroll */}
      <div id="home">
        <HomePage />
      </div>

      <div id="features">
        <FeaturesPage />
      </div>

      <div id="how-it-works">
        <HowItWorksPage />
      </div>

      <div id="benefits">
        <BenefitsPage />
      </div>

      <div id="get-started">
        <GetStartedPage />
      </div>
    </div>
  );
};
