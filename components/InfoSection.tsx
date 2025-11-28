import React from 'react';
import { RESUME_DATA, UI_TRANSLATIONS } from '../constants';
import { Language } from '../types';
import GradeChart from './GradeChart';

interface InfoSectionProps {
  language: Language;
}

const InfoSection: React.FC<InfoSectionProps> = ({ language }) => {
  const t = UI_TRANSLATIONS;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Skills & Languages */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <i className="fas fa-tools text-blue-600"></i> {t.skills_languages[language]}
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
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:col-span-2">
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
       <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:col-span-2">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <i className="fas fa-project-diagram text-blue-600"></i> {t.key_projects[language]}
        </h2>
        <div className="space-y-4">
          {RESUME_DATA.projects.map((proj, idx) => (
            <div key={idx} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <div className="flex justify-between items-start">
                <div>
                   <h3 className="font-bold text-gray-800">{proj.name}</h3>
                   {proj.location && <div className="text-xs text-gray-400 mt-0.5"><i className="fas fa-map-pin mr-1"></i>{proj.location}</div>}
                </div>
                <span className="text-xs font-mono bg-gray-200 text-gray-700 px-2 py-0.5 rounded whitespace-nowrap">{proj.year}</span>
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