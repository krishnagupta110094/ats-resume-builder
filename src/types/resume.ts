export interface BasicDetails {
  name: string;
  title: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  // Legacy fields for backward compatibility
  firstName?: string;
  surname?: string;
  github?: string;
  linkedin?: string;
  city?: string;
  country?: string;
  pinCode?: string;
  location?: string;
}

export interface Education {
  institution: string;
  degree: string;
  specialization: string;
  startDate: string;
  endDate: string;
  location: string;
  cgpa: string;
  percentage: string;
  // Legacy fields
  year: string;
  university: string;
}

export interface Experience {
  jobTitle: string;
  employer: string;
  city: string;
  country: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  // Keep legacy fields for backward compatibility
  year: string;
  company: string;
  location: string;
  role: string;
  position: string;
  description: string;
}

export interface Project {
  name: string;
  result: string;
  technologies: string;
  github?: string;
  // Legacy fields for backward compatibility
  techStack?: string;
  description?: string;
  link?: string;
  year?: string;
}

export interface Skills {
  techSkills: string[];
  softSkills: string[];
  // Legacy fields for backward compatibility
  programmingLanguages?: string;
  librariesFrameworks?: string;
  toolsPlatforms?: string;
  databases?: string;
}

export interface Certification {
  name: string;
  link: string;
  // Legacy fields for backward compatibility
  issuer?: string;
  year?: string;
}

export interface Award {
  title: string;
  description: string;
  year: string;
}

export interface ATSAnalysis {
  score: number;
  keywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export interface ATSKeywords {
  industry: string[];
  technical: string[];
  soft: string[];
}

export interface ResumeData {
  basicdetails: BasicDetails;
  about: string;
  education: Education[];
  techSkills: string[];
  softSkills: string[];
  certifications: Certification[];
  experience: Experience[];
  projects: Project[];
  // Legacy fields for backward compatibility
  skills?: Skills;
  awards?: Award[];
}