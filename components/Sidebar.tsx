import React, { useState, useEffect } from 'react';
import { UI_TRANSLATIONS } from '../constants';
import { Language } from '../types';
import SimpleTooltip from './SimpleTooltip';

interface SidebarProps {
  language: Language;
  onDesktopCollapse: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ language, onDesktopCollapse, isMobileOpen, setIsMobileOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const t = UI_TRANSLATIONS;

  const toggleDesktopSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onDesktopCollapse(newState);
  };

  const navItems = [
    { id: 'home', label: t.nav_home[language], icon: 'fa-home' },
    { id: 'map', label: t.global_footprint[language], icon: 'fa-globe-europe' },
    { id: 'timeline', label: t.timeline[language], icon: 'fa-chart-bar' },
    { id: 'skills', label: t.skills_certifications[language], icon: 'fa-tools' },
    { id: 'education', label: t.education[language], icon: 'fa-graduation-cap' },
    { id: 'projects', label: t.key_projects[language], icon: 'fa-project-diagram' },
    { id: 'experience', label: t.experience_history[language], icon: 'fa-briefcase' },
  ];

  // Scroll Spy Logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.2, rootMargin: "-20% 0px -50% 0px" } // Adjusted logic for mobile
    );

    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [navItems]);

  const handleNavClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      // Close mobile menu on click
      setIsMobileMenuOpen(false);
    }
  };

  const setIsMobileMenuOpen = (isOpen: boolean) => {
    setIsMobileOpen(isOpen);
  };

  return (
    <aside 
      className={`fixed top-0 left-0 h-full bg-slate-900 text-white transition-transform duration-300 ease-in-out z-[100] flex flex-col shadow-2xl 
        ${/* Mobile Logic: Slide in/out */ ''}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        ${/* Desktop Logic: Always visible (translate-x-0), width varies */ ''}
        lg:translate-x-0 
        ${/* Width Logic */ ''}
        ${collapsed ? 'lg:w-20 w-64' : 'w-64'}
      `}
    >
      {/* Header/Logo Area */}
      <div className="h-20 flex items-center justify-center border-b border-slate-700 shrink-0">
         <div className="font-bold text-xl tracking-widest text-blue-400 truncate px-4">
           {/* On mobile always show full name, on desktop check collapsed */}
           <span className="lg:hidden">R. BOLDEVIN</span>
           <span className="hidden lg:inline">{collapsed ? 'RB' : 'R. BOLDEVIN'}</span>
         </div>
         
         {/* Close button for Mobile */}
         <button 
           onClick={() => setIsMobileMenuOpen(false)}
           className="lg:hidden absolute right-4 text-slate-400 hover:text-white"
         >
           <i className="fas fa-times text-xl"></i>
         </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-8 flex flex-col gap-2 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`flex items-center gap-4 px-6 py-4 transition-all hover:bg-slate-800 text-left ${
              activeSection === item.id 
                ? 'bg-blue-600 text-white border-r-4 border-blue-300' 
                : 'text-slate-400 border-r-4 border-transparent'
            }`}
            title={item.label}
          >
            <i className={`fas ${item.icon} text-lg w-6 text-center ${activeSection === item.id ? 'text-white' : 'text-slate-500'}`}></i>
            <span className={`font-medium whitespace-nowrap transition-opacity duration-200 
              ${/* Mobile: Always visible */ ''}
              lg:block
              ${/* Desktop: Hide if collapsed */ ''}
              ${collapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'lg:opacity-100'}
            `}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Collapse Toggle (Desktop Only) */}
      <div className="hidden lg:block">
        <SimpleTooltip text={collapsed ? "Expand Sidebar" : "Collapse Sidebar"} position="right" className="w-full">
          <button 
            onClick={toggleDesktopSidebar}
            className="h-16 w-full border-t border-slate-700 hover:bg-slate-800 transition-colors flex items-center justify-center text-slate-400 hover:text-white"
          >
            <i className={`fas ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </SimpleTooltip>
      </div>
    </aside>
  );
};

export default Sidebar;