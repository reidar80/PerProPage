import React from 'react';
import { RESUME_DATA } from '../constants';
import { Language } from '../types';
import { format, parseISO } from 'date-fns';
import SimpleTooltip from './SimpleTooltip';

interface ExperienceListProps {
  language: Language;
}

const ExperienceList: React.FC<ExperienceListProps> = ({ language }) => {
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM. yyyy').toLowerCase();
    } catch (error) {
      return dateString;
    }
  };

  const handleLocClick = (lat: number, lng: number) => {
    const event = new CustomEvent('map:highlight', { 
      detail: { locations: [{ lat, lng }], zoom: 11.7 } 
    });
    window.dispatchEvent(event);
  };

  const handleCompanyClick = (companyName: string) => {
    const prompt = `Please research the company "${companyName}" online. Provide a short description (100 words or less, no bullet points) that includes its Sector(s), Size, and Geographic presence (Global/Local). Include a link to their official website.`;
    const event = new CustomEvent('chat:trigger', {
      detail: { prompt }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
      <div className="space-y-8">
        {RESUME_DATA.employmentHistory.map((job, index) => {
          const formattedStartDate = formatDate(job.startDate);
          const formattedEndDate = job.endDate === "Present" 
            ? (language === 'no' ? 'Nå' : (language === 'zh' ? '至今' : 'Present')) 
            : formatDate(job.endDate);

          return (
            <div key={index} className="relative pl-6 sm:pl-8 border-l-2 border-blue-200 last:border-0 pb-6 last:pb-0">
              <div className="absolute top-0 left-[-9px] w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                <SimpleTooltip text="Ask AI for company details" position="top">
                  <h3 
                    onClick={() => handleCompanyClick(job.company)}
                    className="text-lg font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors group flex items-center"
                  >
                    {job.company} 
                    <i className="fas fa-sparkles text-xs ml-2 text-blue-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all"></i>
                  </h3>
                </SimpleTooltip>
                
                <span className="text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full mt-1 sm:mt-0 w-fit">
                  {formattedStartDate} — {formattedEndDate}
                </span>
              </div>

              <h4 className="text-md font-semibold text-gray-700 mb-2">{job.role[language]}</h4>
              
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-2">
                {job.locations && job.locations.length > 0 ? (
                  job.locations.map((loc, i) => (
                    <SimpleTooltip key={i} text={`Zoom map to ${loc.name}`} position="top">
                      <button 
                        onClick={() => handleLocClick(loc.lat, loc.lng)}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded"
                      >
                        <i className="fas fa-map-marker-alt text-xs"></i>
                        {loc.name}
                      </button>
                    </SimpleTooltip>
                  ))
                ) : (
                  <div className="flex items-center">
                    <SimpleTooltip text={`Zoom map to ${job.location}`} position="top">
                      <button
                        onClick={() => handleLocClick(job.lat, job.lng)}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded"
                      >
                        <i className="fas fa-map-marker-alt text-xs mr-1"></i>
                        {job.location}
                      </button>
                    </SimpleTooltip>
                  </div>
                )}
              </div>

              {job.description && (
                <p className="text-sm text-gray-600 leading-relaxed mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {job.description[language]}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExperienceList;