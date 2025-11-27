import React, { useState } from 'react';
import Header from './components/Header';
import MapComponent from './components/MapComponent';
import TimelineChart from './components/TimelineChart';
import ExperienceList from './components/ExperienceList';
import ChatWidget from './components/ChatWidget';
import InfoSection from './components/InfoSection';
import { UI_TRANSLATIONS } from './constants';
import { Language } from './types';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const t = UI_TRANSLATIONS;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-blue-200">
      
      <Header language={language} setLanguage={setLanguage} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Section A: Map */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <i className="fas fa-globe-europe text-blue-600 text-xl"></i>
            <h2 className="text-2xl font-bold text-gray-800">{t.global_footprint[language]}</h2>
          </div>
          <MapComponent language={language} />
        </section>

        {/* Section B: Timeline */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <i className="fas fa-chart-bar text-blue-600 text-xl"></i>
            <h2 className="text-2xl font-bold text-gray-800">{t.timeline[language]}</h2>
          </div>
          <TimelineChart />
        </section>

        {/* Section C: New Info Section (Skills, Certs, Projects) */}
        <section>
          <InfoSection language={language} />
        </section>

        {/* Section D: Detailed Experience List */}
        <section>
           <div className="flex items-center gap-2 mb-4">
            <i className="fas fa-briefcase text-blue-600 text-xl"></i>
            <h2 className="text-2xl font-bold text-gray-800">{t.experience_history[language]}</h2>
          </div>
          <ExperienceList language={language} />
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-500 py-8 mt-12 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Reidar J. Boldevin. {t.footer_rights[language]}
        </p>
        <p className="text-xs mt-2 opacity-60">
          {t.footer_generated[language]}
        </p>
      </footer>

      <ChatWidget />
    </div>
  );
};

export default App;