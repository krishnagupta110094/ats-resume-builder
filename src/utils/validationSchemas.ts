// Form validation schemas using Zod
import { z } from 'zod';

// Basic Details Schema
export const basicDetailsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  title: z.string().min(2, 'Job title is required').max(100, 'Title too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  address: z.string().optional()
});

// Education Schema
export const educationSchema = z.object({
  year: z.string().min(1, 'Year is required'),
  degree: z.string().min(1, 'Degree is required'),
  university: z.string().min(1, 'University is required'),
  cgpa: z.string().optional()
});

// Experience Schema
export const experienceSchema = z.object({
  year: z.string().min(1, 'Duration is required'),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().min(1, 'Location is required'),
  role: z.string().min(1, 'Job title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters')
});

// Project Schema
export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  result: z.string().min(10, 'Description must be at least 10 characters'),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  technologies: z.string().min(1, 'Technologies are required')
});

// Certification Schema
export const certificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  link: z.string().url('Invalid certificate URL').optional().or(z.literal(''))
});

// Complete Resume Schema
export const resumeSchema = z.object({
  basicdetails: basicDetailsSchema,
  about: z.string().min(50, 'Professional summary must be at least 50 characters').max(500, 'Summary too long'),
  education: z.array(educationSchema).min(1, 'At least one education entry is required'),
  techSkills: z.array(z.string().min(1, 'Skill cannot be empty')).min(1, 'At least one technical skill is required'),
  softSkills: z.array(z.string().min(1, 'Skill cannot be empty')).min(1, 'At least one soft skill is required'),
  certifications: z.array(certificationSchema).optional(),
  experience: z.array(experienceSchema).optional(),
  projects: z.array(projectSchema).min(1, 'At least one project is required')
});

// Create a flexible schema that adapts based on section visibility
export const createFlexibleResumeSchema = (sectionVisibility: SectionVisibility) => {
  return z.object({
    basicdetails: basicDetailsSchema,
    about: z.string().min(50, 'Professional summary must be at least 50 characters').max(500, 'Summary too long'),
    education: z.array(educationSchema).min(1, 'At least one education entry is required'),
    techSkills: z.array(z.string().min(1, 'Skill cannot be empty')).min(1, 'At least one technical skill is required'),
    softSkills: z.array(z.string().min(1, 'Skill cannot be empty')).min(1, 'At least one soft skill is required'),
    certifications: z.array(certificationSchema).optional(),
    experience: sectionVisibility.experience 
      ? z.array(experienceSchema).min(1, 'At least one work experience is required when experience section is visible')
      : z.array(experienceSchema).optional(),
    projects: z.array(projectSchema).min(1, 'At least one project is required')
  });
};

// Section Visibility Schema
export const sectionVisibilitySchema = z.object({
  experience: z.boolean(),
  projects: z.boolean(),
  certifications: z.boolean()
});

// Export types
export type BasicDetails = z.infer<typeof basicDetailsSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type ResumeData = z.infer<typeof resumeSchema>;
export type SectionVisibility = z.infer<typeof sectionVisibilitySchema>;

// Validation helper functions
export const validateSection = (section: string, data: any) => {
  try {
    switch (section) {
      case 'basicdetails':
        return basicDetailsSchema.parse(data);
      case 'education':
        return z.array(educationSchema).parse(data);
      case 'experience':
        // Experience is optional - only validate if array has content
        return data && data.length > 0 ? z.array(experienceSchema).parse(data) : [];
      case 'projects':
        return z.array(projectSchema).parse(data);
      case 'certifications':
        // Certifications are optional
        return data && data.length > 0 ? z.array(certificationSchema).parse(data) : [];
      default:
        throw new Error(`Unknown section: ${section}`);
    }
  } catch (error) {
    console.error(`Validation error for ${section}:`, error);
    throw error;
  }
};

export const validateCompleteResume = (data: ResumeData) => {
  try {
    return resumeSchema.parse(data);
  } catch (error) {
    console.error('Resume validation error:', error);
    throw error;
  }
};