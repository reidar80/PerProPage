import React, { useState } from 'react';
import { RESUME_DATA, UI_TRANSLATIONS } from '../constants';
import { Language } from '../types';
import { generatePdfSummary } from '../services/geminiService';
import { generatePDF } from '../utils/pdfGenerator';
import SimpleTooltip from './SimpleTooltip';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  id?: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage, id, onMenuClick }) => {
  const { contact } = RESUME_DATA;
  const [imgError, setImgError] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const t = UI_TRANSLATIONS;

  const handleLocationClick = () => {
    const event = new CustomEvent('map:focus', { 
      detail: { lat: 59.8333, lng: 10.4400, zoom: 11.9 } 
    });
    window.dispatchEvent(event);
  };

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    const pdfLanguage: Language = language === 'zh' ? 'en' : language;

    setIsGeneratingPdf(true);
    try {
      let imgBase64: string | undefined = undefined;
      try {
        const response = await fetch('img/reidar.jpg');
        const blob = await response.blob();
        imgBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn("Could not load image for PDF", e);
      }

      const aiSummary = await generatePdfSummary(pdfLanguage);
      await generatePDF(RESUME_DATA, pdfLanguage, aiSummary, imgBase64);
    } catch (e) {
      console.error("Failed to generate PDF", e);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <header id={id} className="bg-slate-900 text-white py-8 lg:py-12 px-4 sm:px-6 lg:px-8 shadow-md relative scroll-mt-20">
      
      {/* Top Bar (Mobile Menu + Language) */}
      <div className="flex justify-between items-center mb-6 lg:mb-0 lg:absolute lg:top-4 lg:right-4 lg:z-10 w-full lg:w-auto">
        
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <i className="fas fa-bars text-2xl"></i>
        </button>

        {/* Language Switcher */}
        <div className="flex gap-3">
          <SimpleTooltip text="Switch to English" position="bottom">
            <button 
              onClick={() => setLanguage('en')} 
              className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${language === 'en' ? 'border-blue-400' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <img src="https://flagcdn.com/w80/gb.png" alt="English" className="w-full h-full object-cover" />
            </button>
          </SimpleTooltip>
          
          <SimpleTooltip text="Bytt til Norsk" position="bottom">
            <button 
              onClick={() => setLanguage('no')} 
              className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${language === 'no' ? 'border-blue-400' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <img src="https://flagcdn.com/w80/no.png" alt="Norsk" className="w-full h-full object-cover" />
            </button>
          </SimpleTooltip>

          <SimpleTooltip text="切换到中文" position="bottom">
            <button 
              onClick={() => setLanguage('zh')} 
              className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${language === 'zh' ? 'border-blue-400' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <img src="https://flagcdn.com/w80/cn.png" alt="Chinese" className="w-full h-full object-cover" />
            </button>
          </SimpleTooltip>
        </div>
      </div>

      <div className="w-full mt-4 lg:mt-0">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8">
          
          {/* Profile Image */}
          <div className="shrink-0 relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-slate-700 shadow-xl bg-slate-800">
              <img 
                src="img/reidar.jpg" 
                alt={contact.name} 
                className="w-full h-full object-cover object-top" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none'; 
                  setImgError(true);
                }}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-col xl:flex-row gap-6 items-start">
              
              {/* Contact Details Column */}
              <div className="flex-1 text-center md:text-left w-full">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight break-words">
                  {contact.name}
                </h1>
                <p className="text-lg sm:text-xl text-blue-400 font-medium mt-2">
                  {contact.title[language]}
                </p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 text-slate-300 text-sm mt-4">
                  <SimpleTooltip text="Zoom map to Asker" position="bottom">
                    <button 
                      onClick={handleLocationClick}
                      className="flex items-center gap-2 hover:text-blue-400 transition-colors cursor-pointer bg-transparent border-none p-0 text-inherit"
                    >
                      <i className="fas fa-map-marker-alt text-blue-500"></i> {contact.location}
                    </button>
                  </SimpleTooltip>
                  
                  <SimpleTooltip text="Send email to Reidar" position="bottom">
                    <a 
                      href={`mailto:${contact.email}`} 
                      className="flex items-center gap-2 hover:text-blue-400 transition-colors break-all"
                    >
                      <i className="fas fa-envelope text-blue-500"></i> {contact.email}
                    </a>
                  </SimpleTooltip>

                  <span className="flex items-center gap-2 cursor-default whitespace-nowrap">
                    <i className="fas fa-phone text-blue-500"></i> {contact.mobile}
                  </span>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start pt-6 gap-3">
                  <SimpleTooltip text="Open LinkedIn Profile" position="bottom">
                    <a 
                      href={contact.linkedin} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-white font-medium shadow-md text-sm sm:text-base"
                    >
                      <i className="fab fa-linkedin text-xl"></i>
                      <span>{t.linkedin_profile[language]}</span>
                    </a>
                  </SimpleTooltip>
                  
                  <SimpleTooltip text="Generate PDF Resume" position="bottom">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isGeneratingPdf}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white font-medium shadow-md disabled:opacity-50 disabled:cursor-wait text-sm sm:text-base"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <i className="fas fa-circle-notch fa-spin"></i>
                          <span>{t.generating_pdf[language]}</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-file-pdf"></i>
                          <span>{t.download_pdf[language]}</span>
                        </>
                      )}
                    </button>
                  </SimpleTooltip>
                </div>
              </div>

              {/* About Me Column (Right side on XL screens) */}
              <div className="w-full xl:w-96 shrink-0 text-left xl:mt-10">
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm h-full">
                  <h2 className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-2">{t.about_me[language]}</h2>
                  <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                    {contact.bio[language]}
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;