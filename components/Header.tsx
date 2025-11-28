import React from 'react';
import { RESUME_DATA, UI_TRANSLATIONS } from '../constants';
import { Language } from '../types';
import { useState } from 'react';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage }) => {
  const { contact } = RESUME_DATA;
  const [imgError, setImgError] = useState(false);
  const t = UI_TRANSLATIONS;

  const handleLocationClick = () => {
    // Dispatch event to map component
    // Coordinates for Asker, Norway
    const event = new CustomEvent('map:focus', { 
      detail: { lat: 59.8333, lng: 10.4400, zoom: 12 } 
    });
    window.dispatchEvent(event);
  };

  return (
    <header className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-md relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button 
          onClick={() => setLanguage('en')} 
          className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${language === 'en' ? 'border-blue-400' : 'border-transparent opacity-70 hover:opacity-100'}`}
          title="English"
        >
          <img src="https://flagcdn.com/w80/gb.png" alt="English" className="w-full h-full object-cover" />
        </button>
        <button 
          onClick={() => setLanguage('no')} 
          className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${language === 'no' ? 'border-blue-400' : 'border-transparent opacity-70 hover:opacity-100'}`}
          title="Norsk"
        >
          <img src="https://flagcdn.com/w80/no.png" alt="Norsk" className="w-full h-full object-cover" />
        </button>
        <button 
          onClick={() => setLanguage('zh')} 
          className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${language === 'zh' ? 'border-blue-400' : 'border-transparent opacity-70 hover:opacity-100'}`}
          title="Chinese"
        >
          <img src="https://flagcdn.com/w80/cn.png" alt="Chinese" className="w-full h-full object-cover" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
          
          {/* Profile & Contact Info */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8 flex-1 min-w-0">
            
            {/* Profile Image */}
            <div className="shrink-0 relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-slate-700 shadow-xl bg-slate-800">
                <img 
                  src="img/reidar.jpg" 
                  alt={contact.name} 
                  className="w-full h-full object-cover object-top" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'; 
                    setImgError(true); // Tracking error if needed for fallback UI logic
                  }}
                />
              </div>
            </div>

            {/* Contact Text */}
            <div className="space-y-2 text-center md:text-left min-w-0 flex-1">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight break-words">
                {contact.name}
              </h1>
              <p className="text-xl text-blue-400 font-medium">
                {contact.title[language]}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-300 text-sm mt-4">
                <button 
                  onClick={handleLocationClick}
                  className="flex items-center gap-2 hover:text-blue-400 transition-colors cursor-pointer bg-transparent border-none p-0 text-inherit"
                  title="Show on map"
                >
                  <i className="fas fa-map-marker-alt text-blue-500"></i> {contact.location}
                </button>
                <a 
                  href={`mailto:${contact.email}`} 
                  className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                >
                  <i className="fas fa-envelope text-blue-500"></i> {contact.email}
                </a>
                <span className="flex items-center gap-2">
                  <i className="fas fa-phone text-blue-500"></i> {contact.mobile}
                </span>
              </div>
              
              <div className="flex justify-center md:justify-start pt-2">
                <a 
                  href={contact.linkedin} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-white font-medium shadow-md"
                >
                  <i className="fab fa-linkedin text-xl"></i>
                  <span>{t.linkedin_profile[language]}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bio Box */}
          <div className="w-full lg:max-w-lg bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm mt-4 lg:mt-0">
            <h2 className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-2">{t.about_me[language]}</h2>
            <p className="text-slate-300 leading-relaxed">
              {contact.bio[language]}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;