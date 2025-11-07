import React, { useState, useEffect } from 'react';
import LogoutButton from '../components/LogoutButton';
import ResumeAppBar from '../components/ResumeAppBar';
import { useNavigate } from 'react-router-dom';
import { userApi, resumeStorage } from '../services/backendApi';
import { Loader2, Trash2, Edit2, Eye, Download } from 'lucide-react';
import AnalyticsChart from '../components/AnalyticsChart';
import { ExportService } from '../services/exportService';
import './Dashboard.css';

interface ResumeItem {
  id: string;
  name: string;
  data: any;
  createdAt: string;
  updatedAt: string;
  views: number;
  downloads: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [savedResumes, setSavedResumes] = useState<ResumeItem[]>([]);
  const [userProfile, setUserProfile] = useState({ id: '', name: '', email: '' });
  const [analytics, setAnalytics] = useState({ totalResumes: 0, totalViews: 0, totalDownloads: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Load user profile from backend /me endpoint
      try {
        const userData = await userApi.getCurrentUser();
        setUserProfile({
          id: userData.id,
          name: userData.name || 'User',
          email: userData.email
        });

        // Load resumes from localStorage
        const resumes = resumeStorage.getAllResumes(userData.id);
        setSavedResumes(resumes);

        // Calculate analytics
        const totalViews = resumes.reduce((sum, r) => sum + (r.views || 0), 0);
        const totalDownloads = resumes.reduce((sum, r) => sum + (r.downloads || 0), 0);
        setAnalytics({
          totalResumes: resumes.length,
          totalViews,
          totalDownloads
        });
      } catch (apiError) {
        console.log('Backend /me failed, using localStorage fallback');
        // Fallback to localStorage if backend fails
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsed = JSON.parse(userData);
          setUserProfile({
            id: parsed.id || 'local',
            name: parsed.name || 'User',
            email: parsed.email || ''
          });

          const resumes = resumeStorage.getAllResumes(parsed.id || 'local');
          setSavedResumes(resumes);

          const totalViews = resumes.reduce((sum, r) => sum + (r.views || 0), 0);
          const totalDownloads = resumes.reduce((sum, r) => sum + (r.downloads || 0), 0);
          setAnalytics({
            totalResumes: resumes.length,
            totalViews,
            totalDownloads
          });
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigate('/profile');
  };

  const handleViewResume = (resume: ResumeItem) => {
    // Increment view count
    resumeStorage.incrementViews(userProfile.id, resume.id);
    
    // Navigate to preview
    navigate('/resume-preview', { 
      state: { 
        generatedResume: resume.data,
        resumeId: resume.id
      } 
    });
    
    // Reload to update analytics
    loadDashboardData();
  };

  const handleDeleteResume = (resumeId: string) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      resumeStorage.deleteResume(userProfile.id, resumeId);
      loadDashboardData();
    }
  };

  const handleDownloadResume = async (resume: ResumeItem) => {
    // Increment download count
    resumeStorage.incrementDownloads(userProfile.id, resume.id);
    
    // Transform resume data for export
    const exportData = {
      personalInfo: {
        name: resume.data.basicdetails?.name || 'Unknown',
        email: resume.data.basicdetails?.email || '',
        phone: resume.data.basicdetails?.phone || '',
        location: resume.data.basicdetails?.address || '',
        website: resume.data.basicdetails?.website || ''
      },
      summary: resume.data.about || '',
      experience: resume.data.experience || [],
      education: resume.data.education || [],
      skills: [...(resume.data.techSkills || []), ...(resume.data.softSkills || [])],
      projects: resume.data.projects || [],
      certifications: resume.data.certifications || []
    };

    // Quick download as PDF
    try {
      await ExportService.exportToPDF('temp-resume-container', `${resume.name}.pdf`);
    } catch (error) {
      console.error('Download failed:', error);
    }
    
    // Reload to update analytics
    loadDashboardData();
  };

  const handleCreateResume = () => {
    navigate('/builder');
  };

  const handleNavigation = (nav: string) => {
    switch (nav) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'generate':
        navigate('/builder');
        break;
      case 'certification':
        navigate('/certificate-generator');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'change-password':
        navigate('/change-password');
        break;
      case 'leads':
        // TODO: Add leads page route when implemented
        console.log('Customer Leads - Coming Soon');
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <>
        <LogoutButton />
        <div className="dashboard-loading">
          <Loader2 size={48} className="spinner" />
          <p>Loading your dashboard...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <LogoutButton />
        <div className="dashboard-error">
          <p>{error}</p>
          <button onClick={loadDashboardData} className="retry-btn">Retry</button>
        </div>
      </>
    );
  }

  return (
    <>
      <ResumeAppBar onNav={handleNavigation} rightAction={<LogoutButton />} />
      <div className="dashboard-page">
        <div className="dashboard-container">
          <h1 className="dashboard-welcome">Welcome back, {userProfile.name}! 👋</h1>

          {/* Profile Management */}
          <div className="dashboard-card">
            <h2 className="card-title">Profile Management</h2>
            <div className="profile-info">
              <div className="profile-item">
                <span className="profile-label">Name:</span>
                <span className="profile-value">{userProfile.name}</span>
              </div>
              <div className="profile-item">
                <span className="profile-label">Email:</span>
                <span className="profile-value">{userProfile.email}</span>
              </div>
            </div>
            <button onClick={handleEditProfile} className="edit-profile-btn">
              ✏️ Edit Profile
            </button>
          </div>

          {/* Saved Resumes */}
          <div className="dashboard-card">
            <h2 className="card-title">Saved Resumes ({savedResumes.length})</h2>
            {savedResumes.length > 0 ? (
              <div className="resumes-list">
                {savedResumes.map((resume) => (
                  <div key={resume.id} className="resume-item-enhanced">
                    <div className="resume-info">
                      <h3 className="resume-title">{resume.name}</h3>
                      <div className="resume-meta">
                        <span className="resume-date">Created: {formatDate(resume.createdAt)}</span>
                        <span className="resume-stats">
                          <Eye size={14} /> {resume.views || 0} views
                        </span>
                        <span className="resume-stats">
                          <Download size={14} /> {resume.downloads || 0} downloads
                        </span>
                      </div>
                    </div>
                    <div className="resume-actions">
                      <button 
                        onClick={() => handleViewResume(resume)} 
                        className="action-btn-small view-btn"
                        title="View Resume"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleDownloadResume(resume)} 
                        className="action-btn-small download-btn"
                        title="Download Resume"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteResume(resume.id)} 
                        className="action-btn-small delete-btn"
                        title="Delete Resume"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-resumes">
                No saved resumes yet.{' '}
                <button onClick={handleCreateResume} className="create-resume-link">
                  Create one now
                </button>
              </div>
            )}
          </div>

          {/* Analytics */}
          <div className="dashboard-card analytics-section">
            <AnalyticsChart
              resumes={savedResumes}
              totalViews={analytics.totalViews}
              totalDownloads={analytics.totalDownloads}
              totalResumes={analytics.totalResumes}
            />
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button 
                onClick={() => navigate('/analytics')} 
                className="view-detailed-analytics-btn"
              >
                📊 View Detailed Analytics
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card">
            <h2 className="card-title">Quick Actions</h2>
            <div className="quick-actions">
              <button onClick={handleCreateResume} className="action-btn">
                ➕ Create New Resume
              </button>
              <button onClick={() => navigate('/change-password')} className="action-btn">
                🔒 Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
