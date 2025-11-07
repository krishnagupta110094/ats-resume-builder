import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, Wand2 } from 'lucide-react';
import ExportOptions from '../components/ExportOptions';
import ResumeAppBar from '../components/ResumeAppBar';
import LogoutButton from '../components/LogoutButton';
import './ResumePreview.css';

interface GeneratedResumeData {
  basicdetails: {
    name: string;
    title: string;
    phone: string;
    email: string;
    website: string;
    address: string;
  };
  about: string;
  education: Array<{
    year: string;
    degree: string;
    university: string;
    cgpa: string;
  }>;
  techSkills: string[];
  softSkills: string[];
  certifications: Array<{
    name: string;
    link: string;
  }>;
  experience: Array<{
    year: string;
    company: string;
    location: string;
    role: string;
    description: string;
  }>;
  projects: Array<{
    name: string;
    result: string;
    github: string;
    technologies: string;
  }>;
  optimizedForATS?: boolean;
  generatedAt?: string;
}

interface SectionVisibility {
  experience: boolean;
  projects: boolean;
  certifications: boolean;
}

export default function ResumePreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState<GeneratedResumeData | null>(null);
  const [generatedHTML, setGeneratedHTML] = useState<string | null>(null);
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>({
    experience: true,
    projects: true,
    certifications: true
  });

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

  useEffect(() => {
    // Get the resume data passed from the previous page
    if (location.state && location.state.generatedResume) {
      setResumeData(location.state.generatedResume);
      setGeneratedHTML(location.state.generatedHTML || null);
      setSectionVisibility(location.state.sectionVisibility || {
        experience: true,
        projects: true,
        certifications: true
      });
    } else {
      // If no data, redirect back to builder
      navigate('/builder');
    }
  }, [location, navigate]);

  // Transform resume data for export service
  const transformResumeDataForExport = () => {
    if (!resumeData) return null;
    
    return {
      personalInfo: {
        name: resumeData.basicdetails.name,
        email: resumeData.basicdetails.email,
        phone: resumeData.basicdetails.phone,
        location: resumeData.basicdetails.address,
        website: resumeData.basicdetails.website
      },
      summary: resumeData.about,
      experience: resumeData.experience?.map(exp => ({
        title: exp.role,
        company: exp.company,
        location: exp.location,
        startDate: exp.year.split('-')[0] || '',
        endDate: exp.year.split('-')[1] || 'Present',
        description: exp.description
      })),
      education: resumeData.education?.map(edu => ({
        degree: edu.degree,
        institution: edu.university,
        graduationDate: edu.year,
        gpa: edu.cgpa
      })),
      skills: [...(resumeData.techSkills || []), ...(resumeData.softSkills || [])],
      projects: resumeData.projects?.map(proj => ({
        name: proj.name,
        description: proj.result,
        technologies: proj.technologies,
        link: proj.github
      })),
      certifications: resumeData.certifications?.map(cert => ({
        name: cert.name,
        issuer: 'Professional Certification',
        date: new Date().getFullYear().toString()
      }))
    };
  };

  const downloadPDF = () => {
    const printContent = document.getElementById('resume-preview')?.innerHTML;
    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow && printContent) {
      printWindow.document.write('<html><head><title>Resume</title>');
      printWindow.document.write(`
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6;
            color: #333;
          }
          .preview-name { 
            font-size: 2rem; 
            font-weight: bold; 
            margin-bottom: 0.5rem;
            color: #1f2937;
          }
          .preview-section-title { 
            font-size: 1.2rem; 
            font-weight: bold; 
            margin: 1.5rem 0 0.5rem 0;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 0.25rem;
          }
          .preview-item-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            margin-bottom: 0.25rem;
          }
          .preview-item-title { 
            font-weight: 600; 
            color: #1f2937;
            margin: 0;
          }
          .preview-item-date { 
            color: #6b7280; 
            font-weight: 500;
          }
          .preview-skill-tag { 
            display: inline-block; 
            background: #f3f4f6; 
            padding: 0.25rem 0.5rem; 
            margin: 0.125rem; 
            border-radius: 4px; 
            font-size: 0.875rem;
          }
          .ai-optimization-tag {
            display: none;
          }
        </style>
      `);
      printWindow.document.write('</head><body>');
      printWindow.document.write(printContent);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  const goBackToBuilder = () => {
    navigate('/builder');
  };

  if (!resumeData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <ResumeAppBar onNav={handleNavigation} rightAction={<LogoutButton />} />
      <div className="resume-preview-page" style={{ marginTop: '64px' }}>
        {/* Header */}
      <div className="preview-page-header">
        <button onClick={goBackToBuilder} className="back-button">
          <ArrowLeft size={20} />
          Back to Builder
        </button>
        
        <div className="preview-page-title">
          <Wand2 size={24} className="ai-icon" />
          <h1>Your ATS-Optimized Resume</h1>
        </div>
        
        <div className="preview-actions">
          <ExportOptions
            resumeData={transformResumeDataForExport()}
            resumeElementId="resume-preview"
            fileName={resumeData?.basicdetails.name.replace(/\s+/g, '_') || 'resume'}
          />
          <button onClick={downloadPDF} className="download-pdf-btn-legacy">
            <Download size={18} />
            Print/Save
          </button>
        </div>
      </div>

      {/* Resume Content */}
      <div className="resume-container">
        {generatedHTML ? (
          // Display AI-generated HTML from backend
          <div 
            id="resume-preview" 
            className="resume-content ai-generated"
            dangerouslySetInnerHTML={{ __html: generatedHTML }}
          />
        ) : (
          // Fallback: Display formatted resume data
          <div id="resume-preview" className="resume-content">
          {/* Header */}
          <div className="preview-header-section">
            <h1 className="preview-name">{resumeData.basicdetails.name}</h1>
            <p className="preview-email">{resumeData.basicdetails.email}</p>
            <p className="preview-phone">{resumeData.basicdetails.phone}</p>
            <p className="preview-address">{resumeData.basicdetails.address}</p>
            <p className="preview-links">
              <a href={`https://${resumeData.basicdetails.website}`} className="preview-link">{resumeData.basicdetails.website}</a>
            </p>
          </div>

          {/* AI-Optimized About Section */}
          {resumeData.about && (
            <div className="preview-section">
              <h2 className="preview-section-title">ABOUT</h2>
              <p className="preview-section-content ai-optimized">{resumeData.about}</p>
              <span className="ai-optimization-tag">✨ AI Optimized</span>
            </div>
          )}

          {/* Education */}
          <div className="preview-section">
            <h2 className="preview-section-title">EDUCATION</h2>
            {resumeData.education.map((edu, idx) => (
              <div key={idx} className="preview-item">
                <div className="preview-item-header">
                  <h3 className="preview-item-title">{edu.university}</h3>
                  <span className="preview-item-date">{edu.year}</span>
                </div>
                <p className="preview-item-subtitle">{edu.degree}</p>
                {edu.cgpa && <p className="preview-item-detail">CGPA: {edu.cgpa}</p>}
              </div>
            ))}
          </div>

          {/* Experience */}
          {sectionVisibility.experience && (
            <div className="preview-section">
              <h2 className="preview-section-title">EXPERIENCE</h2>
              {resumeData.experience.map((exp, idx) => (
                <div key={idx} className="preview-item">
                  <div className="preview-item-header">
                    <h3 className="preview-item-title">{exp.company} | {exp.role}</h3>
                    <span className="preview-item-date">{exp.location} | {exp.year}</span>
                  </div>
                  <p className="preview-item-description">{exp.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          <div className="preview-section">
            <h2 className="preview-section-title">SKILLS</h2>
            
            {resumeData.techSkills.length > 0 && (
              <div className="preview-skill-category">
                <h3 className="preview-skill-category-title">Technical Skills</h3>
                <div className="preview-skills">
                  {resumeData.techSkills.map((skill, idx) => (
                    <span key={idx} className="preview-skill-tag technical">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {resumeData.softSkills.length > 0 && (
              <div className="preview-skill-category">
                <h3 className="preview-skill-category-title">Soft Skills</h3>
                <div className="preview-skills">
                  {resumeData.softSkills.map((skill, idx) => (
                    <span key={idx} className="preview-skill-tag soft">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Projects */}
          {sectionVisibility.projects && (
            <div className="preview-section">
              <h2 className="preview-section-title">PROJECTS</h2>
              {resumeData.projects.map((proj, idx) => (
                <div key={idx} className="preview-item">
                  <h3 className="preview-item-title">{proj.name}</h3>
                  <p className="preview-item-description">{proj.result}</p>
                  <p className="preview-project-tech">Technologies: {proj.technologies}</p>
                  {proj.github && (
                    <p className="preview-project-link">
                      <a href={proj.github} target="_blank" rel="noopener noreferrer">GitHub Repository</a>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {sectionVisibility.certifications && (
            <div className="preview-section">
              <h2 className="preview-section-title">CERTIFICATIONS</h2>
              <ul className="preview-cert-list">
                {resumeData.certifications.map((cert, idx) => (
                  <li key={idx} className="preview-cert-item">
                    <span>{cert.name}</span>
                    {cert.link && <a href={cert.link} className="preview-cert-link" target="_blank" rel="noopener noreferrer"> - View Certificate</a>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
    </>
  );
}