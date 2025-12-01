import React from 'react';
import { RESUME_DATA, UI_TRANSLATIONS } from '../constants';
import { Language } from '../types';
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
    const prompt = `Describe the project "${projectName}" and the company involved. If the company is named publicly, include a link to their official website. If the project involves non-public details (like "Defense Sector" or generic "Financial customer"), please focus on the technical aspects and the project's significance without revealing confidential entities.`;
    const event = new CustomEvent('chat:trigger', {
      detail: { prompt }
    });
    window.dispatchEvent(event);
  };

  const handleSchoolClick = (schoolName: string) => {
    const prompt = `Summarize Reidars coursework at ${schoolName}, including skills, courses and grades. Include a brief description of ${schoolName} based on public sources`;
    const event = new CustomEvent('chat:trigger', {
      detail: { prompt }
    });
    window.dispatchEvent(event);
  };

  // Helper to render only bullet points from description
  const renderCourseSummaries = (description: string) => {
    const lines = description.split('\n');
    const bulletLines = lines
      .map(line => line.trim())
      .filter(line => line.startsWith('•'));
    
    if (bulletLines.length === 0) return null;

    return (
      <ul className="mt-3 space-y-1 border-t border-gray-200 pt-2">
        {bulletLines.map((line, idx) => {
          // Check for Easter Egg placeholder
          if (line.includes('??')) {
            const parts = line.split('??');
            return (
              <li key={idx} className="text-sm text-gray-700 font-medium">
                {parts[0]}
                <SimpleTooltip text="You found the Easter Egg, click here" position="top">
                  <a 
                    href="https://youtu.be/E4WlUXrJgy4" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-red-500 font-bold hover:underline cursor-pointer"
                  >
                    ??
                  </a>
                </SimpleTooltip>
                {parts[1]}
              </li>
            );
          }
          return (
            <li key={idx} className="text-sm text-gray-700 font-medium">
              {line}
            </li>
          );
        })}
      </ul>
    );
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
              <span key={idx} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-100 flex items-center gap-1.5">
                <span>{lang.name[language]}</span>
                <span className="text-green-600/70 text-xs font-semibold">({lang.proficiency[language]})</span>
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
        
        {/* Static Academic Summary */}
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <h3 className="font-bold text-blue-800 text-sm uppercase tracking-wide mb-1">
            {language === 'no' ? 'Akademiske Prestasjoner' : (language === 'zh' ? '学术成就' : 'Academic Achievements')}
          </h3>
          <p className="text-sm text-blue-900 leading-relaxed">
            {language === 'no' 
              ? "De siste årene har vært viet til å formalisere og utvide min kompetanse gjennom en Executive Master of Management ved Handelshøyskolen BI. Samtidig som jeg har opprettholdt et sterkt karaktersnitt, har mitt primære fokus vært å integrere strategiske disipliner – eierstyring, risiko, etterlevelse (GRC), forretningsutvikling og digital ledelse – inn i min etablerte tekniske grunnmur. Denne akademiske satsingen styrker min evne til å lede komplekse IT-initiativer som er i tråd med organisatoriske mål og regulatoriske rammeverk."
              : (language === 'zh' 
                  ? "近年来的重点是通过挪威商学院（BI Norwegian Business School）的行政管理硕士课程，将我的专业知识正规化并加以拓展。在保持优异成绩的同时，我的主要精力在于将治理、风险、合规 (GRC)、业务发展和数字领导力等战略学科融入我既有的技术基础。这种学术追求增强了我领导符合组织目标和监管框架的复杂 IT 计划的能力。"
                  : "Recent years have been dedicated to formalizing and expanding my expertise through an Executive Master of Management at BI Norwegian Business School. While maintaining a strong GPA, my primary focus has been on integrating strategic disciplines—Governance, Risk, Compliance (GRC), Business Development, and Digital Leadership—into my established technical foundation. This academic pursuit reinforces my ability to lead complex IT initiatives that align strictly with organizational goals and regulatory frameworks.")
            }
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {RESUME_DATA.education.map((edu, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative">
               <div className="absolute top-4 right-4 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {edu.period}
              </div>
              <SimpleTooltip text="Ask AI about this school" position="top">
                <h3 
                  onClick={() => handleSchoolClick(edu.institution)}
                  className="font-bold text-gray-900 text-lg pr-20 cursor-pointer hover:text-blue-600 transition-colors w-fit group"
                >
                  {edu.institution}
                  <i className="fas fa-sparkles text-[10px] ml-2 text-blue-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all"></i>
                </h3>
              </SimpleTooltip>
              <p className="text-sm font-medium text-gray-700 mt-1">{edu.degree[language]}</p>
              
              {/* Only render lines starting with bullets, hide rich descriptions */}
              {edu.description && renderCourseSummaries(edu.description[language])}
            </div>
          ))}
        </div>
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