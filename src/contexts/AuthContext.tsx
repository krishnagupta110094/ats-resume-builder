import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ResumeData } from '../types/resume';
import { authApi } from '../services/backendApi';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface StoredUser extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string, phone?: string) => Promise<boolean>;
  signUp: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  signOut: () => void;
  getUserResume: () => ResumeData | null;
  saveUserResume: (resumeData: ResumeData) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const savedUser = authApi.getCurrentUser();
    if (savedUser) {
      setUser({
        ...savedUser,
        name: savedUser.name || 'User',
        createdAt: new Date().toISOString()
      });
    }

    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string, phone?: string): Promise<boolean> => {
    try {
      // Use backend API for authentication
      const response = await authApi.login({ email, password, phone });
      
      if (response.token && response.user) {
        const userSession = {
          id: response.user.id,
          name: response.user.name || 'User',
          email: response.user.email,
          createdAt: new Date().toISOString()
        };
        
        setUser(userSession);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    }
  };

  const signUp = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    try {
      // Use backend API for registration
      const response = await authApi.register({ name, email, phone, password });
      
      if (response.token && response.user) {
        const userSession = {
          id: response.user.id,
          name: response.user.name || name,
          email: response.user.email,
          createdAt: new Date().toISOString()
        };
        
        setUser(userSession);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Sign up error:', error);
      return false;
    }
  };

  const signOut = () => {
    authApi.logout();
    setUser(null);
  };

  const getUserResume = (): ResumeData | null => {
    if (!user) return null;
    
    try {
      const resumeKey = `resume_${user.id}`;
      const savedResume = localStorage.getItem(resumeKey);
      return savedResume ? JSON.parse(savedResume) : null;
    } catch (error) {
      console.error('Error loading user resume:', error);
      return null;
    }
  };

  const saveUserResume = (resumeData: ResumeData) => {
    if (!user) return;
    
    try {
      const resumeKey = `resume_${user.id}`;
      localStorage.setItem(resumeKey, JSON.stringify(resumeData));
    } catch (error) {
      console.error('Error saving user resume:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
    getUserResume,
    saveUserResume
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}