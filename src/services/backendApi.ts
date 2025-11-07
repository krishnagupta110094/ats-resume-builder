import { apiService } from './apiService';
import type { ResumeData } from '../utils/validationSchemas';

// API Request/Response Interfaces matching your backend exactly
interface LoginRequest {
  email: string;
  password: string;
  phone?: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

// POST /api/resume/Resume - Upload or update resume JSON data (public)
interface ResumeUploadRequest {
  resumeData: ResumeData;
  userId?: string;
}

// POST /api/resume/Ats_resume - Generate HTML resume (protected)
interface ATSResumeRequest {
  resumeData: ResumeData;
  options?: {
    targetRole?: string;
    industry?: string;
    experienceLevel?: 'entry' | 'mid' | 'senior';
    atsOptimization?: boolean;
    keywordDensity?: 'low' | 'medium' | 'high';
  };
}

interface ATSResumeResponse {
  success: boolean;
  html?: string;
  data?: any;
  message?: string;
}

interface UserResponse {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
}

/**
 * Authentication API Service - matches your /api/auth endpoints
 */
export class AuthApiService {
  /**
   * POST /api/auth/login - Login with email & password
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('Attempting login with:', { email: credentials.email, hasPhone: !!credentials.phone });
      
      // Direct fetch call to your backend
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          phone: credentials.phone || '+1-234-567-8900' // Use provided phone or default
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login error response:', errorText);
        throw new Error('Login failed');
      }

      const data = await response.json();
      console.log('Login success, received data:', data);

      // Store token
      if (data.token) {
        apiService.setAuthToken(data.token);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user || { 
          id: '', 
          email: credentials.email,
          name: 'User' 
        }));
      }

      return {
        token: data.token,
        user: data.user || { id: '', email: credentials.email, name: 'User' }
      };
    } catch (error) {
      console.error('Error logging in:', error);
      throw new Error('Invalid email or password. Please check your credentials.');
    }
  }  /**
   * POST /api/register - Register new user with name, email, phone, password
   */
  static async register(userData: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await apiService.post('/api/register', userData, { skipAuth: true });
      const data = response.data as LoginResponse;
      
      // Store token if registration auto-logs in the user
      if (data.token) {
        apiService.setAuthToken(data.token);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Error registering:', error);
      throw new Error('Registration failed. Please try again.');
    }
  }

  /**
   * Logout user
   */
  static logout(): void {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      apiService.clearAuth();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  /**
   * Get current user info
   */
  static getCurrentUser(): { id: string; email: string; name?: string } | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}

/**
 * Resume API Service - matches your /api/resume endpoints
 */
export class ResumeApiService {
  /**
   * POST /api/resume/Resume - Upload or update resume JSON data (public endpoint)
   */
  async uploadResume(data: ResumeUploadRequest): Promise<any> {
    try {
      const response = await apiService.post('/api/resume/Resume', data, { skipAuth: true });
      return response.data;
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw new Error('Failed to upload resume. Please try again.');
    }
  }

  /**
   * POST /api/resume/Ats_resume - Generate HTML resume layout (protected route)
   */
  async generateATSResume(data: ATSResumeRequest): Promise<ATSResumeResponse> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      // Direct fetch call to your backend
      const response = await fetch('http://localhost:3000/api/resume/Ats_resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data.resumeData), // Your backend expects resumeData directly
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to generate resume');
      }

      // Your backend returns HTML directly
      const htmlContent = await response.text();
      
      return {
        success: true,
        html: htmlContent,
        message: 'Resume generated successfully'
      };
    } catch (error) {
      console.error('Error generating ATS resume:', error);
      throw new Error('Failed to generate ATS resume. Please try again.');
    }
  }

  /**
   * Combined: Save resume data and generate ATS version
   */
  async saveAndGenerate(resumeData: ResumeData, options?: any): Promise<ATSResumeResponse> {
    try {
      // Skip upload step - generateATSResume already sends all data to backend
      // The /api/resume/Resume endpoint is not needed since /api/resume/Ats_resume receives full data
      
      // Generate the ATS version (requires authentication and receives full resume data)
      const atsRequest: ATSResumeRequest = {
        resumeData,
        options: {
          atsOptimization: true,
          keywordDensity: 'medium',
          ...options
        }
      };
      
      return await this.generateATSResume(atsRequest);
    } catch (error) {
      console.error('Error in save and generate:', error);
      throw new Error('Failed to save and generate resume. Please try again.');
    }
  }
}

/**
 * User API Service - matches your /me endpoint
 */
export class UserApiService {
  /**
   * GET /me - Get details of currently authenticated user
   */
  async getCurrentUser(): Promise<UserResponse> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:3000/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      return data as UserResponse;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user details. Please try again.');
    }
  }
}

/**
 * Resume Storage Service - Local storage management for resumes
 * TODO: Replace with backend API when available
 */
export class ResumeStorageService {
  private static STORAGE_KEY = 'user_resumes';

  /**
   * Save resume to localStorage
   */
  static saveResume(userId: string, resumeData: ResumeData, resumeName?: string): void {
    try {
      const resumes = this.getAllResumes(userId);
      const newResume = {
        id: Date.now().toString(),
        name: resumeName || `Resume ${resumes.length + 1}`,
        data: resumeData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        downloads: 0
      };

      resumes.push(newResume);
      localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(resumes));
    } catch (error) {
      console.error('Error saving resume:', error);
    }
  }

  /**
   * Get all resumes for a user
   */
  static getAllResumes(userId: string): any[] {
    try {
      const data = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading resumes:', error);
      return [];
    }
  }

  /**
   * Get single resume by ID
   */
  static getResume(userId: string, resumeId: string): any | null {
    try {
      const resumes = this.getAllResumes(userId);
      return resumes.find(r => r.id === resumeId) || null;
    } catch (error) {
      console.error('Error loading resume:', error);
      return null;
    }
  }

  /**
   * Delete resume
   */
  static deleteResume(userId: string, resumeId: string): boolean {
    try {
      const resumes = this.getAllResumes(userId);
      const filtered = resumes.filter(r => r.id !== resumeId);
      localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting resume:', error);
      return false;
    }
  }

  /**
   * Update resume
   */
  static updateResume(userId: string, resumeId: string, resumeData: ResumeData): boolean {
    try {
      const resumes = this.getAllResumes(userId);
      const index = resumes.findIndex(r => r.id === resumeId);
      if (index !== -1) {
        resumes[index].data = resumeData;
        resumes[index].updatedAt = new Date().toISOString();
        localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(resumes));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating resume:', error);
      return false;
    }
  }

  /**
   * Increment view count
   */
  static incrementViews(userId: string, resumeId: string): void {
    try {
      const resumes = this.getAllResumes(userId);
      const resume = resumes.find(r => r.id === resumeId);
      if (resume) {
        resume.views = (resume.views || 0) + 1;
        localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(resumes));
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }

  /**
   * Increment download count
   */
  static incrementDownloads(userId: string, resumeId: string): void {
    try {
      const resumes = this.getAllResumes(userId);
      const resume = resumes.find(r => r.id === resumeId);
      if (resume) {
        resume.downloads = (resume.downloads || 0) + 1;
        localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(resumes));
      }
    } catch (error) {
      console.error('Error incrementing downloads:', error);
    }
  }
}

/**
 * Certificate API Service
 */
interface CertificateGenerationRequest {
  name: string;
  email: string;
  courseName: string;
  fromDate: string;
  toDate: string;
}

export class CertificateApiService {
  /**
   * POST /api/certificates/GenerateCertificate - Generate certificate HTML
   */
  static async generateCertificate(data: CertificateGenerationRequest): Promise<string> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      console.log('Generating certificate with data:', data);

      // Use the same base URL pattern as other API calls
      const baseURL = 'http://localhost:3000';
      const response = await fetch(`${baseURL}/api/certificates/GenerateCertificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      console.log('Certificate generation response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Certificate generation error:', errorText);
        
        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error('Failed to generate certificate. Please try again.');
      }

      // Backend returns HTML as text
      const html = await response.text();
      console.log('Certificate generated successfully');
      
      return html;
    } catch (error: any) {
      console.error('Certificate generation error:', error);
      throw error;
    }
  }
}

// Create singleton instances
export const authApi = AuthApiService;
export const resumeApi = new ResumeApiService();
export const userApi = new UserApiService();
export const resumeStorage = ResumeStorageService;
export const certificateApi = CertificateApiService;

// Export types for use in components
export type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  ResumeUploadRequest,
  ATSResumeRequest,
  ATSResumeResponse,
  UserResponse,
  CertificateGenerationRequest
};