import React, { useEffect, useRef } from 'react';
import { RESUME_DATA, UI_TRANSLATIONS } from '../constants';
import { Job, Project, Language, Location } from '../types';
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
  const pulseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const t = UI_TRANSLATIONS;

  // Helper to extract year from YYYY-MM-DD
  const getYear = (dateStr: string) => {
    if (!dateStr || dateStr === 'Present') return dateStr;
    return dateStr.split('-')[0];
  };

  // Function to get tooltip content based on current language and state
  const getTooltipContent = (isProjectView: boolean, jobs: Job[], projects: Project[], hasJobs: boolean, hasProjects: boolean) => {
    let content = '<div class="font-sans min-w-[200px] sm:min-w-[220px] p-1">';
    
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

  // --- PULSING LOGIC ---
  const stopPulsing = () => {
    if (pulseIntervalRef.current) {
      clearInterval(pulseIntervalRef.current);
      pulseIntervalRef.current = null;
    }
    // Reset all markers to their "normal" color state
    markersRef.current.forEach(marker => {
      // @ts-ignore
      const isProjectView = marker._isProjectView;
      const originalColor = isProjectView ? '#3B82F6' : '#22c55e'; // blue-500 : green-500
      marker.setStyle({ fillColor: originalColor, color: isProjectView ? '#2563EB' : '#16a34a' });
    });
  };

  const startPulsing = (targetMarkers: L.CircleMarker[]) => {
    stopPulsing(); // Clear any existing pulse

    let isYellow = false;
    
    const pulse = () => {
      isYellow = !isYellow;
      targetMarkers.forEach(marker => {
         // @ts-ignore
         const isProjectView = marker._isProjectView;
         const originalFill = isProjectView ? '#3B82F6' : '#22c55e';
         const originalStroke = isProjectView ? '#2563EB' : '#16a34a';

         if (isYellow) {
           marker.setStyle({ fillColor: '#ffff00', color: '#eab308' }); // Yellow / Yellow-600
         } else {
           marker.setStyle({ fillColor: originalFill, color: originalStroke });
         }
      });
    };

    // Initial trigger
    pulse(); 
    // Set interval (0.5Hz = 2 seconds period, so toggle every 1s)
    pulseIntervalRef.current = setInterval(pulse, 1000);
  };

  // --- INIT MAP ---
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
      
      // Force refresh on resize
      setTimeout(() => map.invalidateSize(), 100);
    }

    // Listen for custom "map:focus" events
    const handleMapFocus = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (mapInstanceRef.current && customEvent.detail) {
        const { lat, lng, zoom } = customEvent.detail;
        mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 2 });
      }
    };

    // Listen for custom "map:highlight" events (Multiple or single locations with Pulsing)
    const handleMapHighlight = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (mapInstanceRef.current && customEvent.detail) {
        const locations: { lat: number, lng: number }[] = customEvent.detail.locations;
        const zoom = customEvent.detail.zoom || 11.7;

        // Scroll to map
        mapContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Identify markers to pulse
        const targets: L.CircleMarker[] = [];
        
        locations.forEach(loc => {
           // Find markers close to these coords
           const matched = markersRef.current.find(m => {
             const mLoc = m.getLatLng();
             // Simple float comparison epsilon
             return Math.abs(mLoc.lat - loc.lat) < 0.0001 && Math.abs(mLoc.lng - loc.lng) < 0.0001;
           });
           if (matched) targets.push(matched);
        });

        if (targets.length > 0) {
           startPulsing(targets);
        }

        // Zoom logic
        if (locations.length === 1) {
           mapInstanceRef.current.flyTo([locations[0].lat, locations[0].lng], zoom, { duration: 2 });
        } else if (locations.length > 1) {
           const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng]));
           mapInstanceRef.current.flyToBounds(bounds, { padding: [50, 50], duration: 2 });
        }
      }
    };

    window.addEventListener('map:focus', handleMapFocus);
    window.addEventListener('map:highlight', handleMapHighlight);
    
    // Stop pulsing on window scroll (scrolling away from map)
    const handleWindowScroll = () => {
       if (mapContainerRef.current) {
         const rect = mapContainerRef.current.getBoundingClientRect();
         // If map is completely out of viewport, stop pulsing
         if (rect.bottom < 0 || rect.top > window.innerHeight) {
            stopPulsing();
         }
       }
    };
    window.addEventListener('scroll', handleWindowScroll);

    return () => {
      window.removeEventListener('map:focus', handleMapFocus);
      window.removeEventListener('map:highlight', handleMapHighlight);
      window.removeEventListener('scroll', handleWindowScroll);
      stopPulsing();
    };
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

    // Process Jobs
    RESUME_DATA.employmentHistory.forEach(job => {
      if (job.locations && job.locations.length > 0) {
        job.locations.forEach(loc => addLocation(loc.lat, loc.lng, job, 'job'));
      } else if (job.lat && job.lng) {
        addLocation(job.lat, job.lng, job, 'job');
      }
    });

    // Process Projects
    RESUME_DATA.projects.forEach(proj => {
      if (proj.locations && proj.locations.length > 0) {
        proj.locations.forEach(loc => addLocation(loc.lat, loc.lng, proj, 'project'));
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
    // Responsive Height: 350px on mobile, 500px on default (md+)
    <div className="w-full h-[350px] md:h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-200 z-0 relative">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Legend - Simplified for mobile if needed, but absolute works fine with enough map height */}
      <div className="absolute bottom-4 left-4 bg-white/95 p-3 rounded-lg shadow-md text-xs z-[400] border border-gray-200 backdrop-blur-sm max-w-[200px]">
         <div className="font-bold mb-2 text-gray-700 uppercase tracking-wider text-[10px]">Legend</div>
         <div className="flex items-center gap-2 mb-2">
           <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600 shrink-0"></div>
           <span>{t.map_legend_employment[language]}</span>
         </div>
         <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full bg-blue-500 border border-blue-600 shrink-0"></div>
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