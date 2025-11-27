import React, { useEffect, useRef } from 'react';
import { RESUME_DATA, UI_TRANSLATIONS } from '../constants';
import { Job, Project, Language } from '../types';
import L from 'leaflet';

interface LocationData {
  jobs: Job[];
  projects: Project[];
  lat: number;
  lng: number;
}

interface MapComponentProps {
  language: Language;
}

const MapComponent: React.FC<MapComponentProps> = ({ language }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const t = UI_TRANSLATIONS;

  // Function to get tooltip content based on current language and state
  const getTooltipContent = (isProjectView: boolean, jobs: Job[], projects: Project[], hasJobs: boolean, hasProjects: boolean) => {
    let content = '<div class="font-sans min-w-[200px]">';
    
    if (!isProjectView) {
      // Employment View
      content += `<h3 class="font-bold text-sm border-b pb-1 mb-1 text-green-700">${t.map_legend_employment[language]}</h3>`;
      if (jobs.length > 0) {
        jobs.forEach(j => {
          content += `
            <div class="mb-2 last:mb-0">
              <div class="font-bold text-gray-800">${j.company}</div>
              <div class="text-xs text-gray-600">${j.role[language]}</div>
              <div class="text-xs text-blue-500">${j.startDate.split('-')[0]} - ${j.endDate === 'Present' ? t.present[language] : j.endDate.split('-')[0]}</div>
            </div>`;
        });
      }

      if (hasProjects) {
        content += `<div class="mt-2 pt-1 border-t text-[10px] text-blue-600 font-semibold cursor-pointer"><i class="fas fa-info-circle"></i> ${t.click_projects[language]}</div>`;
      }

    } else {
      // Project View
      content += `<h3 class="font-bold text-sm border-b pb-1 mb-1 text-blue-700">${t.map_legend_project[language]}</h3>`;
      projects.forEach(p => {
        content += `
          <div class="mb-2 last:mb-0">
            <div class="font-bold text-gray-800">${p.name}</div>
            <div class="text-xs text-gray-600 line-clamp-2">${p.description[language]}</div>
            <div class="text-xs text-blue-500">${p.year}</div>
          </div>`;
      });
      
      if (hasJobs) {
         content += `<div class="mt-2 pt-1 border-t text-[10px] text-green-600 font-semibold"><i class="fas fa-undo"></i> ${t.click_employment[language]}</div>`;
      }
    }
    
    content += '</div>';
    return content;
  };

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // Initialize Map
      const map = L.map(mapContainerRef.current).setView([55.0, 15.0], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }
  }, []);

  // Update markers when language changes or map initializes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // 1. Group Data by Location Key (lat,lng)
    const locationMap = new Map<string, LocationData>();

    const addLocation = (lat: number, lng: number, item: Job | Project, type: 'job' | 'project') => {
      const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
      if (!locationMap.has(key)) {
        locationMap.set(key, { jobs: [], projects: [], lat, lng });
      }
      const data = locationMap.get(key)!;
      if (type === 'job') data.jobs.push(item as Job);
      else data.projects.push(item as Project);
    };

    RESUME_DATA.employmentHistory.forEach(job => addLocation(job.lat, job.lng, job, 'job'));
    RESUME_DATA.projects.forEach(proj => {
      if (proj.lat && proj.lng) {
        addLocation(proj.lat, proj.lng, proj, 'project');
      }
    });

    // 2. Render Markers
    locationMap.forEach((data, key) => {
      const { lat, lng, jobs, projects } = data;
      const hasJobs = jobs.length > 0;
      const hasProjects = projects.length > 0;
      
      const greenOptions = {
        color: '#16a34a', // green-600
        fillColor: '#22c55e', // green-500
        fillOpacity: 0.8,
        radius: 8
      };

      const blueOptions = {
        color: '#2563EB', // blue-600
        fillColor: '#3B82F6', // blue-500
        fillOpacity: 0.8,
        radius: 10
      };

      const isInitialProjectView = !hasJobs && hasProjects;
      const initialOptions = isInitialProjectView ? blueOptions : greenOptions;

      const marker = L.circleMarker([lat, lng], initialOptions).addTo(map);
      
      // Store state on marker for interaction
      // @ts-ignore
      marker._isProjectView = isInitialProjectView;
      // @ts-ignore
      marker._data = { jobs, projects, hasJobs, hasProjects };

      // Bind tooltip with current language
      marker.bindTooltip(
        getTooltipContent(isInitialProjectView, jobs, projects, hasJobs, hasProjects), 
        { direction: 'top', offset: [0, -5] }
      );

      // Click Handler
      if (hasJobs && hasProjects) {
        marker.on('click', function(e) {
          const m = e.target;
          m._isProjectView = !m._isProjectView;
          const isProj = m._isProjectView;
          const d = m._data;

          m.setStyle(isProj ? blueOptions : greenOptions);
          m.setTooltipContent(getTooltipContent(isProj, d.jobs, d.projects, d.hasJobs, d.hasProjects));
          m.openTooltip();
        });
      }

      markersRef.current.push(marker);
    });

  }, [language]);

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-200 z-0 relative">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-md text-xs z-[1000] border border-gray-200 backdrop-blur-sm">
         <div className="font-bold mb-2 text-gray-700">Legend</div>
         <div className="flex items-center gap-2 mb-1">
           <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600"></div>
           <span>{t.map_legend_employment[language]}</span>
         </div>
         <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full bg-blue-500 border border-blue-600"></div>
           <span>{t.map_legend_project[language]}</span>
         </div>
         <div className="mt-2 text-[10px] text-gray-500 italic border-t pt-1">
           {t.map_legend_toggle[language]}
         </div>
      </div>
    </div>
  );
};

export default MapComponent;