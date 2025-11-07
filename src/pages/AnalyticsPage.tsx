import React, { useState, useEffect, useCallback } from 'react';
import LogoutButton from '../components/LogoutButton';
import ResumeAppBar from '../components/ResumeAppBar';
import { useNavigate } from 'react-router-dom';
import { userApi, resumeStorage } from '../services/backendApi';
import { Loader2, ArrowLeft, Calendar, TrendingUp, Activity } from 'lucide-react';
import AnalyticsChart from '../components/AnalyticsChart';
import './AnalyticsPage.css';

interface ResumeItem {
  id: string;
  name: string;
  data: any;
  createdAt: string;
  updatedAt: string;
  views: number;
  downloads: number;
  downloadsByFormat?: {
    pdf?: number;
    docx?: number;
    html?: number;
  };
}

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [savedResumes, setSavedResumes] = useState<ResumeItem[]>([]);
  const [userProfile, setUserProfile] = useState({ id: '', name: '', email: '' });
  const [analytics, setAnalytics] = useState({ totalResumes: 0, totalViews: 0, totalDownloads: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month'>('all');

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
        console.log('Customer Leads - Coming Soon');
        break;
      default:
        break;
    }
  };

  const loadAnalyticsData = useCallback(async () => {
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
        let resumes = resumeStorage.getAllResumes(userData.id);

        // Filter by time range
        if (timeRange !== 'all') {
          const now = new Date();
          const daysToFilter = timeRange === 'week' ? 7 : 30;
          const filterDate = new Date(now.getTime() - (daysToFilter * 24 * 60 * 60 * 1000));
          resumes = resumes.filter(r => new Date(r.createdAt) >= filterDate);
        }

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

          let resumes = resumeStorage.getAllResumes(parsed.id || 'local');

          // Filter by time range
          if (timeRange !== 'all') {
            const now = new Date();
            const daysToFilter = timeRange === 'week' ? 7 : 30;
            const filterDate = new Date(now.getTime() - (daysToFilter * 24 * 60 * 60 * 1000));
            resumes = resumes.filter(r => new Date(r.createdAt) >= filterDate);
          }

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
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  if (isLoading) {
    return (
      <>
        <LogoutButton />
        <div className="analytics-page-loading">
          <Loader2 size={48} className="spinner" />
          <p>Loading analytics...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <LogoutButton />
        <div className="analytics-page-error">
          <p>{error}</p>
          <button onClick={loadAnalyticsData} className="retry-btn">Retry</button>
        </div>
      </>
    );
  }

  return (
    <>
      <ResumeAppBar onNav={handleNavigation} rightAction={<LogoutButton />} />
      <div className="analytics-page" style={{ marginTop: '64px' }}>
        <div className="analytics-page-container">
          {/* Header */}
          <div className="analytics-page-header">
            <button onClick={() => navigate('/dashboard')} className="back-btn">
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
            <h1 className="analytics-page-title">
              <Activity className="title-icon" />
              Advanced Analytics
            </h1>
            <p className="analytics-page-subtitle">
              Comprehensive insights into your resume performance
            </p>
          </div>

          {/* Time Range Filter */}
          <div className="time-range-filter">
            <button 
              className={`filter-btn ${timeRange === 'all' ? 'active' : ''}`}
              onClick={() => setTimeRange('all')}
            >
              <Calendar size={16} />
              All Time
            </button>
            <button 
              className={`filter-btn ${timeRange === 'month' ? 'active' : ''}`}
              onClick={() => setTimeRange('month')}
            >
              <Calendar size={16} />
              Last 30 Days
            </button>
            <button 
              className={`filter-btn ${timeRange === 'week' ? 'active' : ''}`}
              onClick={() => setTimeRange('week')}
            >
              <Calendar size={16} />
              Last 7 Days
            </button>
          </div>

          {/* Analytics Chart Component */}
          <div className="analytics-content-card">
            <AnalyticsChart
              resumes={savedResumes}
              totalViews={analytics.totalViews}
              totalDownloads={analytics.totalDownloads}
              totalResumes={analytics.totalResumes}
            />
          </div>

          {/* Additional Insights */}
          <div className="insights-grid">
            {/* Download Formats Breakdown */}
            <div className="insight-card">
              <h3 className="insight-title">
                <Activity size={20} />
                Downloads by Format
              </h3>
              <div className="insight-content">
                {(() => {
                  const pdfDownloads = savedResumes.reduce((sum, r) => sum + (r.downloadsByFormat?.pdf || 0), 0);
                  const docxDownloads = savedResumes.reduce((sum, r) => sum + (r.downloadsByFormat?.docx || 0), 0);
                  const htmlDownloads = savedResumes.reduce((sum, r) => sum + (r.downloadsByFormat?.html || 0), 0);
                  const total = pdfDownloads + docxDownloads + htmlDownloads || 1;
                  
                  return (
                    <div className="format-breakdown">
                      <div className="format-item">
                        <div className="format-header">
                          <span className="format-label">📄 PDF</span>
                          <span className="format-count">{pdfDownloads}</span>
                        </div>
                        <div className="format-bar">
                          <div 
                            className="format-fill pdf-fill"
                            style={{ width: `${(pdfDownloads / total) * 100}%` }}
                          />
                        </div>
                        <span className="format-percent">{((pdfDownloads / total) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="format-item">
                        <div className="format-header">
                          <span className="format-label">📝 DOCX</span>
                          <span className="format-count">{docxDownloads}</span>
                        </div>
                        <div className="format-bar">
                          <div 
                            className="format-fill docx-fill"
                            style={{ width: `${(docxDownloads / total) * 100}%` }}
                          />
                        </div>
                        <span className="format-percent">{((docxDownloads / total) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="format-item">
                        <div className="format-header">
                          <span className="format-label">🌐 HTML</span>
                          <span className="format-count">{htmlDownloads}</span>
                        </div>
                        <div className="format-bar">
                          <div 
                            className="format-fill html-fill"
                            style={{ width: `${(htmlDownloads / total) * 100}%` }}
                          />
                        </div>
                        <span className="format-percent">{((htmlDownloads / total) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <div className="insight-card">
              <h3 className="insight-title">
                <TrendingUp size={20} />
                Engagement Insights
              </h3>
              <div className="insight-content">
                <p className="insight-stat">
                  <span className="stat-label">Average Views per Resume:</span>
                  <span className="stat-value">
                    {analytics.totalResumes > 0 
                      ? (analytics.totalViews / analytics.totalResumes).toFixed(2) 
                      : '0'}
                  </span>
                </p>
                <p className="insight-stat">
                  <span className="stat-label">Average Downloads per Resume:</span>
                  <span className="stat-value">
                    {analytics.totalResumes > 0 
                      ? (analytics.totalDownloads / analytics.totalResumes).toFixed(2) 
                      : '0'}
                  </span>
                </p>
                <p className="insight-stat">
                  <span className="stat-label">Download Conversion Rate:</span>
                  <span className="stat-value">
                    {analytics.totalViews > 0 
                      ? `${((analytics.totalDownloads / analytics.totalViews) * 100).toFixed(1)}%`
                      : '0%'}
                  </span>
                </p>
              </div>
            </div>

            <div className="insight-card">
              <h3 className="insight-title">
                <Activity size={20} />
                Activity Summary
              </h3>
              <div className="insight-content">
                <p className="insight-text">
                  {timeRange === 'all' && `You have created ${analytics.totalResumes} resume${analytics.totalResumes !== 1 ? 's' : ''} in total.`}
                  {timeRange === 'week' && `${analytics.totalResumes} resume${analytics.totalResumes !== 1 ? 's' : ''} created in the last 7 days.`}
                  {timeRange === 'month' && `${analytics.totalResumes} resume${analytics.totalResumes !== 1 ? 's' : ''} created in the last 30 days.`}
                </p>
                <p className="insight-text">
                  Your resumes have been viewed <strong>{analytics.totalViews}</strong> times 
                  and downloaded <strong>{analytics.totalDownloads}</strong> times.
                </p>
                <p className="insight-text">
                  {analytics.totalViews > 0 
                    ? `Great job! Keep creating quality resumes to increase engagement.`
                    : `Start sharing your resumes to track views and downloads.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalyticsPage;
