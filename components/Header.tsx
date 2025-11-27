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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {contact.name}
            </h1>
            <p className="text-xl text-blue-400 font-medium">
              {contact.title[language]}
            </p>
            <div className="flex flex-wrap gap-4 text-slate-300 text-sm mt-4">
              <span className="flex items-center gap-2">
                <i className="fas fa-map-marker-alt text-blue-500"></i> {contact.location}
              </span>
              <span className="flex items-center gap-2">
                <i className="fas fa-envelope text-blue-500"></i> {contact.email}
              </span>
              <span className="flex items-center gap-2">
                <i className="fas fa-phone text-blue-500"></i> {contact.mobile}
              </span>
            </div>
            
            <a 
              href={contact.linkedin} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-3 mt-4 px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors text-white font-medium"
            >
              {!imgError ? (
                <img 
                  src="linkedin_logo.png" 
                  alt="LinkedIn" 
                  className="w-5 h-5 object-contain bg-white rounded-sm" 
                  onError={() => setImgError(true)}
                />
              ) : (
                <i className="fab fa-linkedin text-xl"></i>
              )}
              <span>{t.linkedin_profile[language]}</span>
            </a>
          </div>

          <div className="md:max-w-lg bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
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