import React from 'react';
import { Navbar } from '../../components/landing/LandingNavbar';
import { HeroSection } from '../../components/landing/HeroSection';
import { FeaturesSection } from '../../components/landing/FeaturesSection';
import { HealthDataSection } from '../../components/landing/HealthDataSection';
import { Footer } from '../../components/landing/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-cyan-100 selection:text-cyan-900 transition-colors">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HealthDataSection />
      </main>
      <Footer />
    </div>
  );
}
