import type { ResumeData } from '../types/resume';

export const initialResumeData: ResumeData = {
  basicdetails: {
    firstName: "",
    surname: "",
    title: "",
    phone: "",
    email: "",
    website: "",
    github: "",
    linkedin: "",
    city: "",
    country: "",
    pinCode: "",
    // Legacy fields for backward compatibility
    name: "",
    address: "",
    location: ""
  },
  about: "",
  education: [
    {
      institution: "",
      degree: "",
      specialization: "",
      startDate: "",
      endDate: "",
      location: "",
      cgpa: "",
      percentage: "",
      // Legacy fields
      year: "",
      university: ""
    }
  ],
  skills: {
    techSkills: [""],
    softSkills: [""],
    // Legacy fields for backward compatibility
    programmingLanguages: "",
    librariesFrameworks: "",
    toolsPlatforms: "",
    databases: ""
  },
  certifications: [
    {
      name: "",
      issuer: "",
      year: "",
      link: ""
    }
  ],
  experience: [
    {
      jobTitle: "",
      employer: "",
      city: "",
      country: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      description: "",
      // Legacy fields for compatibility
      year: "",
      company: "",
      location: "",
      role: "",
      position: ""
    }
  ],
  projects: [
    {
      name: "",
      result: "",
      technologies: "",
      github: ""
    }
  ],
  techSkills: [""],
  softSkills: [""],
  awards: [
    {
      title: "",
      description: "",
      year: ""
    }
  ]
};