export type Language = 'en' | 'no' | 'zh';

export interface LocalizedString {
  en: string;
  no: string;
  zh: string;
}

export interface Location {
  name: string;
  lat: number;
  lng: number;
}

export interface LanguageItem {
  name: LocalizedString;
  proficiency: LocalizedString;
}

export interface Job {
  company: string;
  role: LocalizedString;
  startDate: string; // ISO format YYYY-MM-DD
  endDate: string | "Present";
  location: string; // Display string for list
  lat: number; // Primary lat for map grouping if needed
  lng: number; // Primary lng for map grouping if needed
  locations?: Location[]; // Support for multiple locations
  description?: LocalizedString;
}

export interface Project {
  name: string;
  year: string;
  description: LocalizedString;
  locations: Location[]; // Standardized to array
}

export interface Education {
  institution: string;
  degree: LocalizedString;
  period: string;
  description?: LocalizedString;
}

export interface Certification {
  name: string;
  issuer?: string;
  description?: LocalizedString;
}

export interface ResumeData {
  contact: {
    name: string;
    title: LocalizedString;
    location: string;
    address: string;
    email: string;
    mobile: string;
    linkedin: string;
    bio: LocalizedString;
    summary: LocalizedString;
  };
  skills: string[];
  languages: LanguageItem[];
  certifications: Certification[];
  education: Education[];
  employmentHistory: Job[];
  projects: Project[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}