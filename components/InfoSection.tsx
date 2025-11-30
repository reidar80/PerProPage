import React from 'react';
import { RESUME_DATA, UI_TRANSLATIONS } from '../constants';
import { Language } from '../types';
import GradeChart from './GradeChart';
import SimpleTooltip from './SimpleTooltip';

interface InfoSectionProps {
  language: Language;
}

const InfoSection: React.FC<InfoSectionProps> = ({ language }) => {
  const t = UI_TRANSLATIONS;

  const handleLocClick = (locations: {lat: number, lng: number}[]) => {
    const event = new CustomEvent('map:highlight', { 
      detail: { locations, zoom: 11.7 } 
    });
    window.dispatchEvent(event);
  };

  const handleProjectClick = (projectName: string) => {
    const prompt = `Describe the project "${projectName}" and the company involved. If the company is named publicly, include a link to their website. If the project involves non-public details (like "Defense Sector" or generic "Financial customer"), please focus on the technical aspects and the project's significance without revealing confidential entities.`;
    const event = new CustomEvent('chat:trigger', {
      detail: { prompt }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Skills & Certifications */}
      <div id="skills" className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 scroll-mt-24">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <i className="fas fa-tools text-blue-600"></i> {t.skills_certifications[language]}
        </h2>
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">{t.technical_skills[language]}</h3>
          <div className="flex flex-wrap gap-2">
            {RESUME_DATA.skills.map((skill, idx) => (
              <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">{t.languages[language]}</h3>
          <div className="flex flex-wrap gap-2">
            {RESUME_DATA.languages.map((lang, idx) => (
              <span key={idx} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-100">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <i className="fas fa-certificate text-blue-600"></i> {t.certifications[language]}
        </h2>
        <ul className="space-y-4">
          {RESUME_DATA.certifications.map((cert, idx) => (
            <li key={idx} className="flex flex-col gap-1 border-b border-gray-50 last:border-0 pb-3 last:pb-0">
              <div className="flex items-start gap-2">
                <i className="fas fa-check-circle text-green-500 mt-1 flex-shrink-0"></i>
                <span className="text-gray-800 text-sm font-semibold">{cert.name}</span>
              </div>
              {cert.description && (
                <p className="text-xs text-gray-500 pl-6 leading-relaxed">
                  {cert.description[language]}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Education */}
      <div id="education" className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:col-span-2 scroll-mt-24">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <i className="fas fa-graduation-cap text-blue-600"></i> {t.education[language]}
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {RESUME_DATA.education.map((edu, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative">
               <div className="absolute top-4 right-4 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {edu.period}
              </div>
              <h3 className="font-bold text-gray-900 text-lg pr-20">{edu.institution}</h3>
              <p className="text-sm font-medium text-gray-700 mt-1">{edu.degree[language]}</p>
              {edu.description && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">
                    {edu.description[language]}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Grade Visualization */}
        <GradeChart />
      </div>

      {/* Projects */}
       <div id="projects" className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:col-span-2 scroll-mt-24">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <i className="fas fa-project-diagram text-blue-600"></i> {t.key_projects[language]}
        </h2>
        <div className="space-y-4">
          {RESUME_DATA.projects.map((proj, idx) => (
            <div key={idx} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                   <SimpleTooltip text="Ask AI about this project" position="top">
                    <h3 
                      onClick={() => handleProjectClick(proj.name)}
                      className="font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors w-fit group"
                    >
                      {proj.name}
                      <i className="fas fa-sparkles text-[10px] ml-2 text-blue-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all"></i>
                    </h3>
                   </SimpleTooltip>
                   <div className="flex flex-wrap gap-2 mt-1">
                     {proj.locations && proj.locations.length > 0 ? (
                       proj.locations.map((loc, locIdx) => (
                         <SimpleTooltip key={locIdx} text={`Zoom map to ${loc.name}`} position="bottom">
                           <button 
                             onClick={() => handleLocClick([{ lat: loc.lat, lng: loc.lng }])}
                             className="text-xs text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors flex items-center gap-1"
                           >
                             <i className="fas fa-map-marker-alt text-[10px]"></i> {loc.name}
                           </button>
                         </SimpleTooltip>
                       ))
                     ) : (
                        proj.locations && proj.locations.length > 0 && (
                          <div className="text-xs text-gray-400 mt-0.5"><i className="fas fa-map-pin mr-1"></i>{proj.locations[0].name}</div>
                        )
                     )}
                   </div>
                </div>
                <span className="text-xs font-mono bg-gray-200 text-gray-700 px-2 py-0.5 rounded whitespace-nowrap ml-2">{proj.year}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{proj.description[language]}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default InfoSection;