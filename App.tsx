import React, { useState } from 'react';
import Header from './components/Header';
import MapComponent from './components/MapComponent';
import TimelineChart from './components/TimelineChart';
import ExperienceList from './components/ExperienceList';
import InfoSection from './components/InfoSection';
import ChatWidget from './components/ChatWidget';
import Sidebar from './components/Sidebar';
import { UI_TRANSLATIONS } from './constants';
import { Language } from './types';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  // Desktop collapse state
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  // Mobile open state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const t = UI_TRANSLATIONS;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-blue-200 flex flex-col lg:flex-row relative overflow-x-hidden">
      
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar 
        language={language} 
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        onDesktopCollapse={setIsDesktopSidebarCollapsed} 
      />

      {/* Main Content Area */}
      {/* 
         On Desktop (lg): Margin depends on collapse state. 
         On Mobile: Margin is 0, width is full.
      */}
      <div 
        className={`flex-1 min-w-0 transition-all duration-300 w-full 
          ${isDesktopSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} 
          ml-0`}
      >
        <Header 
          id="home" 
          language={language} 
          setLanguage={setLanguage} 
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />

        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-10">
          
          {/* Section A: Map */}
          <section id="map" className="scroll-mt-24">
            <div className="flex items-center gap-2 mb-4">
              <i className="fas fa-globe-europe text-blue-600 text-xl"></i>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t.global_footprint[language]}</h2>
            </div>
            <MapComponent language={language} />
          </section>

          {/* Section B: Timeline */}
          <section id="timeline" className="scroll-mt-24">
            <div className="flex items-center gap-2 mb-4">
              <i className="fas fa-chart-bar text-blue-600 text-xl"></i>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t.timeline[language]}</h2>
            </div>
            <TimelineChart />
          </section>

          {/* Section C: Info Sections (Skills, Certs, Education, Projects) */}
          <InfoSection language={language} />

          {/* Section D: Detailed Experience List */}
          <section id="experience" className="scroll-mt-24">
             <div className="flex items-center gap-2 mb-4">
              <i className="fas fa-briefcase text-blue-600 text-xl"></i>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t.experience_history[language]}</h2>
            </div>
            <ExperienceList language={language} />
          </section>
        </main>

        <footer className="bg-slate-900 text-slate-500 py-8 mt-12 text-center border-t border-slate-800 px-4">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Reidar J. Boldevin. {t.footer_rights[language]}
          </p>
          <p className="text-xs mt-2 opacity-60">
            {t.footer_generated[language]}
          </p>
        </footer>

        <ChatWidget />
      </div>
    </div>
  );
};

export default App;