import { apiService } from './apiService';
import type { ResumeData, SectionVisibility } from '../utils/validationSchemas';

// API Request/Response Interfaces matching your backend
interface LoginRequest {
  email: string;
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

// POST /api/resume/Resume - Upload or update resume JSON data
interface ResumeUploadRequest {
  resumeData: ResumeData;
  userId?: string;
}

interface SaveResumeRequest {
  resumeData: ResumeData;
  userId?: string;
}

interface ResumeResponse {
  success: boolean;
  data?: ResumeData;
  message?: string;
  id?: string;
}

interface GenerateResumeRequest {
  resumeData: ResumeData;
  options?: {
    targetRole?: string;
    industry?: string;
    experienceLevel?: 'entry' | 'mid' | 'senior';
  };
}

interface GeneratedResumeResponse {
  success: boolean;
  html?: string;
  data?: any;
  message?: string;
}

interface ResumeUploadRequest {
  resumeData: ResumeData;
  userId?: string;
}

// POST /api/resume/Ats_resume - Generate HTML resume (protected route)
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

// Access token interfaces (for your accessController)
interface AccessTokenRequest {
  email: string;
  purpose?: string;
}

interface AccessTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    expiresIn: string;
  };
  message: string;
}

// Authentication interfaces
interface AuthResponse {
  success: boolean;
  data: {
    user: any;
    accessToken: string;
    refreshToken?: string;
    expiresIn: string;
  };
  message: string;
}

class ResumeApiService {
  
  /**
   * Save resume data to the server (using your resumeService and Firestore)
   */
  async saveResume(data: SaveResumeRequest): Promise<ResumeResponse> {
    try {
      const response = await apiService.post('/api/resume/save', data);
      const result = response.data as ResumeResponse;
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to save resume');
      }
      
      return result;
    } catch (error) {
      console.error('Error saving resume:', error);
      throw new Error('Failed to save resume. Please try again.');
    }
  }

  /**
   * Update existing resume
   */
  async updateResume(id: string, data: SaveResumeRequest): Promise<ResumeResponse> {
    try {
      const response = await apiService.put(`/api/resume/${id}`, data);
      const result = response.data as ResumeResponse;
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update resume');
      }
      
      return result;
    } catch (error) {
      console.error('Error updating resume:', error);
      throw new Error('Failed to update resume. Please try again.');
    }
  }

  /**
   * Get resume by ID (from Firestore)
   */
  async getResume(id: string): Promise<ResumeResponse> {
    try {
      const response = await apiService.get(`/api/resume/${id}`);
      const result = response.data as ResumeResponse;
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to load resume');
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching resume:', error);
      throw new Error('Failed to load resume. Please try again.');
    }
  }

  /**
   * Get all resumes for current user
   */
  async getUserResumes(): Promise<ResumeResponse[]> {
    try {
      const response = await apiService.get<ResumeResponse[]>('/resumes/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user resumes:', error);
      throw new Error('Failed to load your resumes. Please try again.');
    }
  }

  /**
   * Delete resume
   */
  async deleteResume(id: string): Promise<void> {
    try {
      await apiService.delete(`/resumes/${id}`);
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw new Error('Failed to delete resume. Please try again.');
    }
  }

  /**
   * Generate ATS-optimized resume using AI (Gemini service)
   */
  async generateATSResume(data: GenerateResumeRequest): Promise<GeneratedResumeResponse> {
    try {
      // Based on your backend structure, this should call your resume generation endpoint
      const response = await apiService.post('/api/resume/generate', data);
      const result = response.data as GeneratedResumeResponse;
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to generate resume');
      }
      
      return result;
    } catch (error) {
      console.error('Error generating ATS resume:', error);
      throw new Error('Failed to generate ATS-optimized resume. Please try again.');
    }
  }

  /**
   * Analyze resume for ATS compatibility
   */
  async analyzeResume(resumeData: ResumeData): Promise<{
    score: number;
    suggestions: string[];
    keywords: string[];
    missingElements: string[];
  }> {
    try {
      const response = await apiService.post('/ai/analyze-resume', { resumeData });
      return response.data as {
        score: number;
        suggestions: string[];
        keywords: string[];
        missingElements: string[];
      };
    } catch (error) {
      console.error('Error analyzing resume:', error);
      throw new Error('Failed to analyze resume. Please try again.');
    }
  }

  /**
   * Export resume as PDF (using your pdfService)
   */
  async exportResumeToPDF(resumeData: ResumeData): Promise<Blob> {
    try {
      const response = await apiService.post('/api/resume/export/pdf', { resumeData }, {
        responseType: 'blob'
      } as any);
      return new Blob([response.data as any], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error exporting resume to PDF:', error);
      throw new Error('Failed to export resume to PDF. Please try again.');
    }
  }

  /**
   * Share resume (generate shareable link)
   */
  async shareResume(resumeId: string, options: { 
    expiresIn?: string;
    password?: string;
    allowDownload?: boolean;
  } = {}): Promise<{ shareUrl: string; expiresAt: string }> {
    try {
      const response = await apiService.post(`/resumes/${resumeId}/share`, options);
      return response.data as { shareUrl: string; expiresAt: string };
    } catch (error) {
      console.error('Error sharing resume:', error);
      throw new Error('Failed to create shareable link. Please try again.');
    }
  }
}

// Authentication API Service
class AuthApiService {
  
  /**
   * Sign in user
   */
  async signIn(email: string, password: string): Promise<{
    user: any;
    token: string;
    expiresIn: string;
  }> {
    try {
      const response = await apiService.post('/auth/signin', { email, password }, { skipAuth: true });
      const data = response.data as { user: any; token: string; expiresIn: string };
      
      // Store token
      if (data.token) {
        apiService.setAuthToken(data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw new Error('Invalid email or password. Please try again.');
    }
  }

  /**
   * Sign up user
   */
  async signUp(userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<{
    user: any;
    token: string;
    message: string;
  }> {
    try {
      const response = await apiService.post('/auth/signup', userData, { skipAuth: true });
      const data = response.data as { user: any; token: string; message: string };
      
      // Store token
      if (data.token) {
        apiService.setAuthToken(data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw new Error('Failed to create account. Please try again.');
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      await apiService.post('/auth/signout');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      // Always clear local auth data
      apiService.clearAuth();
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<{ token: string; expiresIn: string }> {
    try {
      const response = await apiService.post('/auth/refresh');
      const data = response.data as { token: string; expiresIn: string };
      
      if (data.token) {
        apiService.setAuthToken(data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Session expired. Please sign in again.');
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<any> {
    try {
      const response = await apiService.get('/auth/profile');
      return response.data as any;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw new Error('Failed to load profile. Please try again.');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: any): Promise<any> {
    try {
      const response = await apiService.patch('/auth/profile', profileData);
      return response.data as any;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile. Please try again.');
    }
  }
}

/**
 * Access API Service (for your accessController endpoints)
 */
class AccessApiService {
  
  /**
   * Request access token
   */
  static async requestAccessToken(data: AccessTokenRequest): Promise<AccessTokenResponse> {
    try {
      const response = await apiService.post('/api/access/request-token', data, { skipAuth: true });
      const result = response.data as AccessTokenResponse;
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to request access token');
      }
      
      return result;
    } catch (error) {
      console.error('Error requesting access token:', error);
      throw new Error('Failed to request access token. Please try again.');
    }
  }

  /**
   * Verify access token
   */
  static async verifyAccessToken(token: string): Promise<{ valid: boolean; user?: any }> {
    try {
      const response = await apiService.post('/api/access/verify-token', { token }, { skipAuth: true });
      const result = response.data as any;
      
      if (!result.success) {
        throw new Error(result.message || 'Invalid access token');
      }
      
      return { valid: true, user: result.data?.user };
    } catch (error) {
      console.error('Error verifying access token:', error);
      return { valid: false };
    }
  }
}

// Create service instances
export const resumeApi = new ResumeApiService();
export const authApi = new AuthApiService();
export const accessApi = AccessApiService;

// Export types
export type {
  SaveResumeRequest,
  ResumeResponse,
  GenerateResumeRequest,
  GeneratedResumeResponse,
  AccessTokenRequest,
  AccessTokenResponse,
  AuthResponse
};