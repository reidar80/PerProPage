import React from 'react';
import { RESUME_DATA } from '../constants';
import { Language } from '../types';
import { format, parseISO } from 'date-fns';

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

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="space-y-8">
        {RESUME_DATA.employmentHistory.map((job, index) => {
          const formattedStartDate = formatDate(job.startDate);
          const formattedEndDate = job.endDate === "Present" 
            ? (language === 'no' ? 'Nå' : (language === 'zh' ? '至今' : 'Present')) 
            : formatDate(job.endDate);

          return (
            <div key={index} className="relative pl-8 border-l-2 border-blue-200 last:border-0 pb-4">
              <div className="absolute top-0 left-[-9px] w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900">{job.company}</h3>
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full mt-2 sm:mt-0 w-fit">
                  {formattedStartDate} — {formattedEndDate}
                </span>
              </div>
              <h4 className="text-md font-semibold text-gray-700 mb-2">{job.role[language]}</h4>
              
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <i className="fas fa-map-marker-alt mr-2"></i>
                {job.location}
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