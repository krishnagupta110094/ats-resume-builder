import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ResumeBuilder from './pages/ResumeBuilder';
import ResumePreviewPage from './pages/ResumePreviewPage';
import BackendTest from './components/BackendTest';
import ChangePasswordPage from './pages/ChangePasswordPage';
import Dashboard from './pages/Dashboard';
import ProfileEditPage from './pages/ProfileEditPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CertificateGeneratorPage from './pages/CertificateGeneratorPage';
import PublicCertificateView from './pages/PublicCertificateView';

export default function App() {
  // Prevent spacebar from causing page issues
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // If spacebar is pressed and no input/textarea is focused
      if (event.code === 'Space' && event.target && 
          !['INPUT', 'TEXTAREA', 'BUTTON'].includes((event.target as HTMLElement).tagName)) {
        // Allow spacebar in input fields but prevent page scrolling
        if (!(event.target as HTMLElement).closest('input, textarea, [contenteditable]')) {
          event.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route 
              path="/builder" 
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <ResumeBuilder />
                  </ErrorBoundary>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resume-preview" 
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <ResumePreviewPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              } 
            />
            <Route path="/test" element={<ProtectedRoute><BackendTest /></ProtectedRoute>} />
            <Route 
              path="/change-password" 
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfileEditPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/certificate-generator" 
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <CertificateGeneratorPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              } 
            />
            {/* Public certificate view - no authentication required */}
            <Route 
              path="/certificate/:certificateId" 
              element={
                <ErrorBoundary>
                  <PublicCertificateView />
                </ErrorBoundary>
              } 
            />
            <Route path="/" element={<Navigate to="/signin" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}