import React from 'react';
import { TrendingUp, Eye, Download, FileText, Calendar } from 'lucide-react';
import './AnalyticsChart.css';

interface ResumeAnalytics {
  id: string;
  name: string;
  views: number;
  downloads: number;
  createdAt: string;
}

interface AnalyticsChartProps {
  resumes: ResumeAnalytics[];
  totalViews: number;
  totalDownloads: number;
  totalResumes: number;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  resumes,
  totalViews,
  totalDownloads,
  totalResumes
}) => {
  // Calculate engagement rate
  const engagementRate = totalResumes > 0 
    ? ((totalViews + totalDownloads) / (totalResumes * 2) * 100).toFixed(1)
    : '0.0';

  // Get top performing resume
  const topResume = resumes.length > 0
    ? resumes.reduce((prev, current) => 
        (prev.views + prev.downloads) > (current.views + current.downloads) ? prev : current
      )
    : null;

  // Calculate activity trend (resumes created in last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentResumes = resumes.filter(r => new Date(r.createdAt) >= sevenDaysAgo).length;

  // Get max value for chart scaling
  const maxViews = Math.max(...resumes.map(r => r.views), 1);
  const maxDownloads = Math.max(...resumes.map(r => r.downloads), 1);

  // Sort resumes by total engagement
  const sortedResumes = [...resumes].sort((a, b) => 
    (b.views + b.downloads) - (a.views + a.downloads)
  ).slice(0, 5); // Top 5

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2 className="analytics-title">
          <TrendingUp className="analytics-icon" />
          Analytics Overview
        </h2>
        <p className="analytics-subtitle">Track your resume performance and engagement</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card metric-primary">
          <div className="metric-icon-wrapper primary">
            <Eye className="metric-icon" />
          </div>
          <div className="metric-content">
            <p className="metric-label">Total Views</p>
            <p className="metric-value">{totalViews.toLocaleString()}</p>
            <p className="metric-change positive">
              {totalResumes > 0 ? `${(totalViews / totalResumes).toFixed(1)} avg/resume` : '0 avg'}
            </p>
          </div>
        </div>

        <div className="metric-card metric-success">
          <div className="metric-icon-wrapper success">
            <Download className="metric-icon" />
          </div>
          <div className="metric-content">
            <p className="metric-label">Total Downloads</p>
            <p className="metric-value">{totalDownloads.toLocaleString()}</p>
            <p className="metric-change positive">
              {totalResumes > 0 ? `${(totalDownloads / totalResumes).toFixed(1)} avg/resume` : '0 avg'}
            </p>
          </div>
        </div>

        <div className="metric-card metric-info">
          <div className="metric-icon-wrapper info">
            <FileText className="metric-icon" />
          </div>
          <div className="metric-content">
            <p className="metric-label">Total Resumes</p>
            <p className="metric-value">{totalResumes}</p>
            <p className="metric-change neutral">
              {recentResumes} created this week
            </p>
          </div>
        </div>

        <div className="metric-card metric-warning">
          <div className="metric-icon-wrapper warning">
            <TrendingUp className="metric-icon" />
          </div>
          <div className="metric-content">
            <p className="metric-label">Engagement Rate</p>
            <p className="metric-value">{engagementRate}%</p>
            <p className="metric-change neutral">
              Activity score
            </p>
          </div>
        </div>
      </div>

      {/* Top Performing Resume */}
      {topResume && (
        <div className="top-performer-card">
          <div className="top-performer-header">
            <h3 className="top-performer-title">🏆 Top Performing Resume</h3>
          </div>
          <div className="top-performer-content">
            <p className="top-performer-name">{topResume.name}</p>
            <div className="top-performer-stats">
              <div className="stat-item">
                <Eye size={16} />
                <span>{topResume.views} views</span>
              </div>
              <div className="stat-item">
                <Download size={16} />
                <span>{topResume.downloads} downloads</span>
              </div>
              <div className="stat-item">
                <Calendar size={16} />
                <span>{new Date(topResume.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume Performance Chart */}
      {sortedResumes.length > 0 && (
        <div className="chart-card">
          <h3 className="chart-title">Resume Performance Comparison</h3>
          <div className="chart-container">
            {sortedResumes.map((resume, index) => (
              <div key={resume.id} className="chart-row">
                <div className="chart-label">
                  <span className="resume-rank">#{index + 1}</span>
                  <span className="resume-name-truncate" title={resume.name}>
                    {resume.name}
                  </span>
                </div>
                <div className="chart-bars">
                  <div className="bar-group">
                    <div className="bar-label">
                      <Eye size={14} />
                      <span>{resume.views}</span>
                    </div>
                    <div className="bar-wrapper">
                      <div 
                        className="bar bar-views"
                        style={{ width: `${(resume.views / maxViews) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-label">
                      <Download size={14} />
                      <span>{resume.downloads}</span>
                    </div>
                    <div className="bar-wrapper">
                      <div 
                        className="bar bar-downloads"
                        style={{ width: `${(resume.downloads / maxDownloads) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color bar-views"></div>
              <span>Views</span>
            </div>
            <div className="legend-item">
              <div className="legend-color bar-downloads"></div>
              <span>Downloads</span>
            </div>
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      {resumes.length > 0 && (
        <div className="timeline-card">
          <h3 className="timeline-title">Recent Activity</h3>
          <div className="timeline-container">
            {resumes.slice(0, 5).map((resume, index) => {
              const daysAgo = Math.floor(
                (new Date().getTime() - new Date(resume.createdAt).getTime()) / (1000 * 60 * 60 * 24)
              );
              return (
                <div key={resume.id} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <p className="timeline-resume-name">{resume.name}</p>
                    <p className="timeline-date">
                      {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
                    </p>
                    <div className="timeline-stats">
                      <span className="timeline-stat">
                        <Eye size={12} /> {resume.views}
                      </span>
                      <span className="timeline-stat">
                        <Download size={12} /> {resume.downloads}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {resumes.length === 0 && (
        <div className="analytics-empty">
          <FileText size={64} className="empty-icon" />
          <h3 className="empty-title">No Analytics Yet</h3>
          <p className="empty-message">
            Create your first resume to start tracking performance metrics!
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsChart;
