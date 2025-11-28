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

  // Helper to extract year from YYYY-MM-DD
  const getYear = (dateStr: string) => {
    if (!dateStr || dateStr === 'Present') return dateStr;
    return dateStr.split('-')[0];
  };

  // Function to get tooltip content based on current language and state
  const getTooltipContent = (isProjectView: boolean, jobs: Job[], projects: Project[], hasJobs: boolean, hasProjects: boolean) => {
    let content = '<div class="font-sans min-w-[220px] p-1">';
    
    if (!isProjectView) {
      // --- Employment View ---
      content += `<h3 class="font-bold text-sm border-b border-green-200 pb-1 mb-2 text-green-700 flex items-center gap-2">
        <i class="fas fa-briefcase"></i> ${t.map_legend_employment[language]}
      </h3>`;
      
      if (jobs.length > 0) {
        content += '<ul class="list-none space-y-3 m-0 p-0">';
        jobs.forEach(j => {
          const startYear = getYear(j.startDate);
          const endYear = j.endDate === 'Present' ? t.present[language] : getYear(j.endDate);
          content += `
            <li>
              <div class="font-bold text-gray-800 text-sm">${j.company}</div>
              <div class="text-xs text-gray-600 font-medium">${j.role[language]}</div>
              <div class="text-[10px] text-gray-400 mt-0.5"><i class="far fa-calendar-alt mr-1"></i>${startYear} - ${endYear}</div>
            </li>`;
        });
        content += '</ul>';
      }

      if (hasProjects) {
        content += `<div class="mt-3 pt-2 border-t border-gray-100 text-[10px] text-blue-600 font-bold uppercase tracking-wide flex items-center justify-end gap-1">
          ${t.click_projects[language]} <i class="fas fa-arrow-right"></i>
        </div>`;
      }

    } else {
      // --- Project View ---
      content += `<h3 class="font-bold text-sm border-b border-blue-200 pb-1 mb-2 text-blue-700 flex items-center gap-2">
        <i class="fas fa-project-diagram"></i> ${t.map_legend_project[language]}
      </h3>`;
      
      if (projects.length > 0) {
        content += '<ul class="list-none space-y-3 m-0 p-0">';
        projects.forEach(p => {
          content += `
            <li>
              <div class="font-bold text-gray-800 text-sm">${p.name}</div>
              <div class="text-xs text-gray-600 font-medium line-clamp-2">${p.description[language]}</div>
              <div class="text-[10px] text-gray-400 mt-0.5"><i class="far fa-clock mr-1"></i>${p.year}</div>
            </li>`;
        });
        content += '</ul>';
      }
      
      if (hasJobs) {
         content += `<div class="mt-3 pt-2 border-t border-gray-100 text-[10px] text-green-600 font-bold uppercase tracking-wide flex items-center justify-end gap-1">
           ${t.click_employment[language]} <i class="fas fa-undo"></i>
         </div>`;
      }
    }
    
    content += '</div>';
    return content;
  };

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // Initialize Map
      const map = L.map(mapContainerRef.current, {
        scrollWheelZoom: true // Enable scroll zoom
      }).setView([55.0, 15.0], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    // Listen for custom "map:focus" events
    const handleMapFocus = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (mapInstanceRef.current && customEvent.detail) {
        const { lat, lng, zoom } = customEvent.detail;
        mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 2 });
      }
    };

    window.addEventListener('map:focus', handleMapFocus);
    return () => window.removeEventListener('map:focus', handleMapFocus);
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
      // Round to 4 decimals to group close locations
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
        fillOpacity: 0.9,
        radius: 10,
        weight: 2
      };

      const blueOptions = {
        color: '#2563EB', // blue-600
        fillColor: '#3B82F6', // blue-500
        fillOpacity: 0.9,
        radius: 12, // Slightly larger to differentiate
        weight: 2
      };

      // Default state: If we have jobs, show green. If ONLY projects, show blue.
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
        { 
          direction: 'top', 
          offset: [0, -10],
          className: 'leaflet-tooltip-custom',
          opacity: 1 
        }
      );

      // Click Handler for Toggle
      if (hasJobs && hasProjects) {
        marker.on('click', function(e) {
          const m = e.target;
          // Toggle view state
          m._isProjectView = !m._isProjectView;
          
          const isProj = m._isProjectView;
          const d = m._data;

          // Update Style
          m.setStyle(isProj ? blueOptions : greenOptions);
          
          // Update Tooltip Content
          m.setTooltipContent(getTooltipContent(isProj, d.jobs, d.projects, d.hasJobs, d.hasProjects));
          
          // Keep tooltip open to see the change immediately
          m.openTooltip();
        });
      }

      markersRef.current.push(marker);
    });

  }, [language]);

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-200 z-0 relative">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 p-3 rounded-lg shadow-md text-xs z-[400] border border-gray-200 backdrop-blur-sm">
         <div className="font-bold mb-2 text-gray-700 uppercase tracking-wider text-[10px]">Legend</div>
         <div className="flex items-center gap-2 mb-2">
           <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600"></div>
           <span>{t.map_legend_employment[language]}</span>
         </div>
         <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full bg-blue-500 border border-blue-600"></div>
           <span>{t.map_legend_project[language]}</span>
         </div>
         <div className="mt-2 text-[10px] text-gray-500 italic border-t border-gray-200 pt-1">
           {t.map_legend_toggle[language]}
         </div>
      </div>
    </div>
  );
};

export default MapComponent;