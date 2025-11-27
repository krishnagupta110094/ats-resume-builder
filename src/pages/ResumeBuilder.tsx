import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Wand2, Loader2, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import AIResumeGenerator from '../services/AIResumeGenerator';
import { useFormController, useSectionVisibility } from '../hooks/useFormController';
import { resumeApi, resumeStorage } from '../services/backendApi';
import { initialResumeData } from '../data/initialData';
import EnvironmentSelector from '../components/EnvironmentSelector';
import LogoutButton from '../components/LogoutButton';
import ResumeAppBar from '../components/ResumeAppBar';
import PaymentModal from '../components/PaymentModal';
import type { ResumeData } from '../types/resume';
import './ResumeBuilder.css';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function ResumeBuilder() {
  const navigate = useNavigate();
  
  const {
    sectionVisibility,
    toggleSection
  } = useSectionVisibility({
    experience: true,
    projects: true,
    certifications: true
  });

  // Define sections for drag-and-drop
  const [sections, setSections] = useState([
    'about',
    'education',
    'experience',
    'techSkills',
    'softSkills',
    'projects',
    'certifications'
  ]);

  // Theme state
  const [theme, setTheme] = useState('modern');
  
  // Available themes with metadata
  const themes = [
    { 
      id: 'modern', 
      name: 'Modern', 
      description: 'Clean and contemporary design',
      industry: 'Tech, Startups',
      color: '#667eea',
      preview: '📱'
    },
    { 
      id: 'classic', 
      name: 'Classic', 
      description: 'Traditional professional layout',
      industry: 'Corporate, Finance',
      color: '#2563eb',
      preview: '📄'
    },
    { 
      id: 'minimal', 
      name: 'Minimal', 
      description: 'Simple and elegant design',
      industry: 'Design, Creative',
      color: '#059669',
      preview: '✨'
    },
    { 
      id: 'creative', 
      name: 'Creative', 
      description: 'Bold and eye-catching',
      industry: 'Marketing, Arts',
      color: '#dc2626',
      preview: '🎨'
    }
  ];
  
  // Collapsible sections state
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  
  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Use the new form management hooks
  const {
    formData: resume,
    errors,
    isValid,
    updateField,
    patchArray,
    validateForm,
    resetForm,
    setFormData
  } = useFormController(initialResumeData, sectionVisibility);

  // Auto-save effect
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('autoSavedResume', JSON.stringify(resume));
      console.log('Resume auto-saved');
    }, 5000); // Save every 5 seconds

    return () => clearTimeout(timer);
  }, [resume]);

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

  // AI Processing State
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Environment selector state
  const [showEnvSelector, setShowEnvSelector] = useState(false);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfxAGtAE7WBt1xM61TAEdP5Zete7kJEL3iy2IBDVWwSI9Vuzw/viewform';

  // Helper functions for array operations
  const addItem = (section: string) => {
    // Handle skill arrays differently - they need string items, not objects
    if (section === 'techSkills' || section === 'softSkills') {
      patchArray(section, 'add', undefined, '');
      return;
    }
    
    const templates = {
      education: { 
        institution: '', 
        degree: '', 
        specialization: '',
        startDate: '',
        endDate: '',
        location: '',
        cgpa: '',
        percentage: '',
        year: '',
        university: ''
      },
      experience: { 
        company: '', 
        position: '',
        location: '', 
        startDate: '',
        endDate: '',
        description: '',
        year: '', 
        role: '' 
      },
      projects: { 
        name: '', 
        description: '', 
        technologies: [],
        startDate: '',
        endDate: '',
        github: '',
        demo: '',
        result: '' 
      },
      certifications: { name: '', issuer: '', issueDate: '', link: '' }
    };
    
    patchArray(section, 'add', undefined, (templates as any)[section]);
  };

  const removeItem = (section: string, index: number) => {
    patchArray(section, 'remove', index);
  };

  // Handle Generate Resume button click - Show payment modal first
  const handleGenerateClick = () => {
    setApiError(null);
    
    // Minimal validation - just name and email required
    if (!resume.basicdetails.name || !resume.basicdetails.email) {
      setApiError('Please fill in at least your name and email before generating your resume.');
      return;
    }
    
    // Show payment modal
    setShowPaymentModal(true);
  };

  // Handle payment confirmation - Redirect to Google Form
  const handlePaymentConfirm = () => {
    setShowPaymentModal(false);
    
    // Save resume data before redirecting
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const resumeName = `${resume.basicdetails.name}'s Resume`;
      resumeStorage.saveResume(user.id || 'local', resume, resumeName);
    }
    
    // Redirect to Google Form
    window.location.href = GOOGLE_FORM_URL;
  };

  // AI Resume Generation Function
  const generateATSResume = async () => {
    setApiError(null);
    
    // Minimal validation - just name and email required
    if (!resume.basicdetails.name || !resume.basicdetails.email) {
      setApiError('Please fill in at least your name and email before generating your resume.');
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('🚀 Starting AI resume generation...');
      
      // Save resume to storage before generating
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const resumeName = `${resume.basicdetails.name}'s Resume`;
        resumeStorage.saveResume(user.id || 'local', resume, resumeName);
        console.log('✅ Resume saved to storage');
      }
      
      // Use backend API service for AI-powered generation
      const result = await resumeApi.saveAndGenerate(resume, {
        targetRole: resume.basicdetails.title || 'Software Engineer',
        industry: 'technology',
        experienceLevel: 'mid',
        atsOptimization: true,
        keywordDensity: 'medium'
      });
      
      console.log('✅ Backend response:', result);
      
      // Backend returns HTML content
      if (result.success && result.html) {
        // Navigate to preview with HTML content
        navigate('/resume-preview', {
          state: {
            generatedResume: resume,
            generatedHTML: result.html,
            sectionVisibility: sectionVisibility
          }
        });
      } else if (result.success && result.data) {
        // Fallback: Navigate with optimized data
        navigate('/resume-preview', {
          state: {
            generatedResume: result.data.optimizedResume || resume,
            sectionVisibility: sectionVisibility
          }
        });
      } else {
        throw new Error(result.message || 'Failed to generate resume');
      }
    } catch (error: any) {
      console.error('❌ Error generating ATS resume:', error);
      
      // Show user-friendly error message
      const errorMessage = error.message || 'Sorry, there was an error generating your resume.';
      
      if (errorMessage.includes('401') || errorMessage.includes('authentication')) {
        setApiError('Session expired. Please login again.');
        setTimeout(() => navigate('/signin'), 2000);
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setApiError('Network error. Please check your connection and try again.');
      } else {
        setApiError(errorMessage + ' Please try again or contact support.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <ResumeAppBar onNav={handleNavigation} rightAction={<LogoutButton />} />
      <div className="form-layout" style={{ marginTop: '64px' }}>
      {/* Environment Selector */}
      <EnvironmentSelector 
        isVisible={showEnvSelector} 
        onToggle={() => setShowEnvSelector(!showEnvSelector)} 
      />
      
      {/* FORM PANEL */}
      <div className="form-panel-centered">
        <div className={`form-container theme-${theme}`}>
          <div className="form-header">
            <h1 className="form-title">ATS Resume Builder</h1>
            <p className="form-subtitle">Fill in your details and let AI create an ATS-optimized resume for you</p>
            
            {/* Enhanced Theme Selector */}
            <div className="theme-selector-section">
              <label className="theme-label">Choose Your Theme:</label>
              <div className="theme-grid">
                {themes.map((themeOption) => (
                  <button
                    key={themeOption.id}
                    type="button"
                    className={`theme-card ${theme === themeOption.id ? 'theme-card-active' : ''}`}
                    onClick={() => setTheme(themeOption.id)}
                  >
                    <div className="theme-info">
                      <h4 className="theme-name">{themeOption.name}</h4>
                      <p className="theme-description">{themeOption.description}</p>
                      <span className="theme-industry">{themeOption.industry}</span>
                    </div>
                    {theme === themeOption.id && (
                      <div className="theme-selected-badge">
                        <Check size={16} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Basic Details */}
          <FormSection title="Basic Details">
            <FormInput 
              label="Full Name" 
              value={resume.basicdetails.name} 
              onChange={(v) => updateField('basicdetails', '', 'name', v)} 
              placeholder="John Doe" 
              required 
            />
            <FormInput 
              label="Job Title" 
              value={resume.basicdetails.title} 
              onChange={(v) => updateField('basicdetails', '', 'title', v)} 
              placeholder="Software Engineer" 
              required 
            />
            <FormInput 
              label="Email" 
              value={resume.basicdetails.email} 
              onChange={(v) => updateField('basicdetails', '', 'email', v)} 
              placeholder="john@example.com" 
              required 
              type="email" 
              validation="email" 
            />
            <FormInput 
              label="Phone" 
              value={resume.basicdetails.phone || ''} 
              onChange={(v) => updateField('basicdetails', '', 'phone', v)} 
              placeholder="+1-234-567-8900" 
              type="tel" 
              validation="phone" 
            />
            <FormInput 
              label="Website" 
              value={resume.basicdetails.website || ''} 
              onChange={(v) => updateField('basicdetails', '', 'website', v)} 
              placeholder="www.johndoe.com" 
              type="url" 
              validation="url" 
            />
            <FormInput 
              label="Address" 
              value={resume.basicdetails.address || ''} 
              onChange={(v) => updateField('basicdetails', '', 'address', v)} 
              placeholder="123 Main St, City, State" 
            />
          </FormSection>

          {/* About */}
          <FormSection 
            title="Professional Summary"
            isCollapsed={collapsedSections.has('about')}
            onToggleCollapse={() => toggleSectionCollapse('about')}
          >
            <p className="section-helper-text">
              💡 <strong>Tip:</strong> Write 2-3 sentences highlighting your expertise, key skills, and career goals. Keep it concise and impactful!
            </p>
            <FormTextarea 
              label="About Yourself" 
              value={resume.about} 
              onChange={(v) => updateField('about', '', null, v)} 
              placeholder="Brief description of your professional background and goals..." 
              maxLength={500} 
              required 
            />
          </FormSection>

          {/* Education */}
          <FormSection 
            title="Education" 
            onAdd={() => addItem('education')}
            isCollapsed={collapsedSections.has('education')}
            onToggleCollapse={() => toggleSectionCollapse('education')}
          >
            <p className="section-helper-text">
              💡 <strong>Tip:</strong> List your education in reverse chronological order (most recent first). Include your degree, institution, and graduation year.
            </p>
            {resume.education?.map((edu, idx) => (
              <div key={idx} className="form-item">
                {resume.education.length > 1 && (
                  <button onClick={() => removeItem('education', idx)} className="form-remove-btn">
                    <Trash2 size={14} />
                  </button>
                )}
                <FormInput label="Year" value={edu.year} onChange={(v) => updateField('education', idx, 'year', v)} placeholder="2020 - 2024" />
                <FormInput label="Degree" value={edu.degree} onChange={(v) => updateField('education', idx, 'degree', v)} placeholder="Bachelor of Computer Science" />
                <FormInput label="University" value={edu.university} onChange={(v) => updateField('education', idx, 'university', v)} placeholder="University Name" />
                <FormInput label="GPA/CGPA (optional)" value={edu.cgpa || ''} onChange={(v) => updateField('education', idx, 'cgpa', v)} placeholder="3.8/4.0 or 8.5/10" />
              </div>
            ))}
          </FormSection>

          {/* Experience */}
          {sectionVisibility.experience ? (
            <FormSection 
              title="Work Experience" 
              onAdd={() => addItem('experience')}
              isCollapsed={collapsedSections.has('experience')}
              onToggleCollapse={() => toggleSectionCollapse('experience')}
            >
              <p className="section-helper-text">
                💡 <strong>Tip:</strong> Focus on achievements and quantifiable results. Use action verbs and include metrics when possible (e.g., "Increased sales by 30%").
              </p>
              <div className="section-options">
                <button 
                  type="button" 
                  onClick={() => toggleSection('experience')} 
                  className="remove-section-btn"
                >
                  I don't have work experience
                </button>
              </div>
              {resume.experience?.map((exp, idx) => (
                <div key={idx} className="form-item">
                  {(resume.experience?.length || 0) > 1 && (
                    <button onClick={() => removeItem('experience', idx)} className="form-remove-btn">
                      <Trash2 size={14} />
                    </button>
                  )}
                  <FormInput label="Duration" value={exp.year} onChange={(v) => updateField('experience', idx, 'year', v)} placeholder="Jan 2023 - Present" />
                  <FormInput label="Company" value={exp.company} onChange={(v) => updateField('experience', idx, 'company', v)} placeholder="Company Name" />
                  <FormInput label="Job Title" value={exp.role} onChange={(v) => updateField('experience', idx, 'role', v)} placeholder="Software Developer" />
                  <FormInput label="Location" value={exp.location} onChange={(v) => updateField('experience', idx, 'location', v)} placeholder="City, State" />
                                    <FormTextarea label="Job Description" value={exp.description} onChange={(v) => updateField('experience', idx, 'description', v)} placeholder="Describe your responsibilities and achievements..." />
                </div>
              ))}
            </FormSection>
          ) : (
            <div className="hidden-section">
              <div className="hidden-section-header">
                <span className="hidden-section-title">Work Experience Section Hidden</span>
                <button 
                  type="button" 
                  onClick={() => toggleSection('experience')} 
                  className="restore-section-btn"
                >
                  Add Work Experience
                </button>
              </div>
              <p className="hidden-section-note">Perfect for students and fresh graduates. You can add work experience later if needed.</p>
            </div>
          )}

          {/* Technical Skills */}
          <FormSection 
            title="Technical Skills" 
            onAdd={() => addItem('techSkills')}
            isCollapsed={collapsedSections.has('techSkills')}
            onToggleCollapse={() => toggleSectionCollapse('techSkills')}
          >
            <p className="section-helper-text">
              💡 <strong>Tip:</strong> List programming languages, frameworks, tools, and technologies you're proficient in. Be honest about your skill level!
            </p>
            {resume.techSkills?.map((skill, idx) => (
              <div key={idx} className="form-list-item">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => updateField('techSkills', idx, null, e.target.value)}
                  className="form-list-input"
                  placeholder="e.g., React, Python, AWS, MongoDB"
                />
                {(resume.techSkills?.length || 0) > 1 && (
                  <button onClick={() => removeItem('techSkills', idx)} className="form-list-remove-btn">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </FormSection>

          {/* Soft Skills */}
          <FormSection 
            title="Soft Skills" 
            onAdd={() => addItem('softSkills')}
            isCollapsed={collapsedSections.has('softSkills')}
            onToggleCollapse={() => toggleSectionCollapse('softSkills')}
          >
            <p className="section-helper-text">
              💡 <strong>Tip:</strong> Include interpersonal skills like communication, leadership, teamwork, and problem-solving. These are highly valued by employers!
            </p>
            {resume.softSkills?.map((skill, idx) => (
              <div key={idx} className="form-list-item">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => updateField('softSkills', idx, null, e.target.value)}
                  className="form-list-input"
                  placeholder="e.g., Leadership, Communication, Problem Solving"
                />
                {(resume.softSkills?.length || 0) > 1 && (
                  <button onClick={() => removeItem('softSkills', idx)} className="form-list-remove-btn">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </FormSection>

          {/* Projects */}
          <FormSection 
            title="Projects & Portfolio" 
            onAdd={() => addItem('projects')}
            isCollapsed={collapsedSections.has('projects')}
            onToggleCollapse={() => toggleSectionCollapse('projects')}
          >
            <p className="section-helper-text">
              💡 <strong>Tip:</strong> Showcase 2-4 of your best projects. Focus on impact, technologies used, and measurable results.
            </p>
            {resume.projects?.map((proj, idx) => (
              <div key={idx} className="form-item">
                {resume.projects.length > 1 && (
                  <button 
                    onClick={() => removeItem('projects', idx)} 
                    className="form-remove-btn"
                    title="Remove this project"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div className="project-number-badge">Project #{idx + 1}</div>
                
                <FormInput 
                  label="Project Title" 
                  value={proj.name} 
                  onChange={(v) => updateField('projects', idx, 'name', v)} 
                  placeholder="e.g., E-Commerce Platform, Weather App, Portfolio Website" 
                  required
                />
                
                <FormTextarea 
                  label="Project Description & Key Achievements" 
                  value={proj.result} 
                  onChange={(v) => updateField('projects', idx, 'result', v)} 
                  placeholder="Describe what you built and the impact it had. Include metrics if possible.&#10;&#10;Example: Built a full-stack e-commerce platform that increased sales by 40%. Implemented secure payment processing, user authentication, and real-time inventory management. Reduced page load time by 60% through optimization."
                  maxLength={500}
                  required
                />
                
                <FormInput 
                  label="Project Link (GitHub, Live Demo, or Portfolio)" 
                  value={proj.github || ''} 
                  onChange={(v) => updateField('projects', idx, 'github', v)} 
                  placeholder="https://github.com/yourusername/project-name or https://yourproject.com" 
                  type="url"
                  validation="url"
                />
                
                <FormInput 
                  label="Tech Stack & Tools" 
                  value={proj.technologies} 
                  onChange={(v) => updateField('projects', idx, 'technologies', v)} 
                  placeholder="e.g., React, TypeScript, Node.js, MongoDB, AWS, Docker" 
                  required
                />
                
                <div className="field-helper-text">
                  <small>💡 Separate technologies with commas for better readability</small>
                </div>
              </div>
            ))}
          </FormSection>

          {/* Certifications */}
          <FormSection 
            title="Certifications (Optional)" 
            onAdd={() => addItem('certifications')}
            isCollapsed={collapsedSections.has('certifications')}
            onToggleCollapse={() => toggleSectionCollapse('certifications')}
          >
            <p className="section-helper-text">
              💡 <strong>Tip:</strong> List relevant certifications, online courses, or professional credentials. Include the issuing organization and completion date if available.
            </p>
            {resume.certifications?.map((cert, idx) => (
              <div key={idx} className="form-item">
                {(resume.certifications?.length || 0) > 1 && (
                  <button onClick={() => removeItem('certifications', idx)} className="form-remove-btn">
                    <Trash2 size={14} />
                  </button>
                )}
                <FormInput label="Certification Name" value={cert.name} onChange={(v) => updateField('certifications', idx, 'name', v)} placeholder="AWS Certified Developer" />
                <FormInput label="Certificate Link (optional)" value={cert.link || ''} onChange={(v) => updateField('certifications', idx, 'link', v)} placeholder="https://certificate-link.com" />
              </div>
            ))}
          </FormSection>

          {/* AI Generation Button */}
          <div className="ai-generation-section">
            <h3 className="ai-section-title">AI-Powered Resume Optimization</h3>
            <p className="ai-section-description">
              Our AI will analyze your information and create an ATS-optimized resume that gets past screening systems and impresses recruiters.
            </p>
             
            {/* Error Display */}
            {apiError && (
              <div className="error-message">
                <strong>Error:</strong> {apiError}
              </div>
            )}
            
            {/* Form Validation Errors */}
            {!isValid && Object.keys(errors).length > 0 && (
              <div className="validation-errors">
                <h4>Please fix the following errors:</h4>
                <ul>
                  {Object.entries(errors).flatMap(([section, sectionErrors]) => {
                    if (typeof sectionErrors === 'string') {
                      return [<li key={section}>{sectionErrors}</li>];
                    } else if (typeof sectionErrors === 'object' && sectionErrors !== null) {
                      return Object.entries(sectionErrors as any).map(([field, error]) => (
                        <li key={`${section}.${field}`}>
                          <strong>{section}.{field}:</strong> {String(error)}
                        </li>
                      ));
                    }
                    return [];
                  })}
                </ul>
              </div>
            )}
            
            <div className="desktop-action-buttons">
              <button 
                type="button"
                onClick={() => {
                  localStorage.setItem('autoSavedResume', JSON.stringify(resume));
                  alert('Resume saved successfully!');
                }}
                className="save-draft-btn"
              >
                💾 Save Draft
              </button>
              <button 
                onClick={handleGenerateClick}
                disabled={isGenerating}
                className={`generate-ats-btn ${isGenerating ? 'generating' : ''}`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Creating Your ATS Resume...
                  </>
                ) : (
                  <>
                    <Wand2 size={20} />
                    Generate My ATS Resume (₹79)
                  </>
                )}
              </button>
            </div>
            <p className="ai-disclaimer">
              * Fields marked with asterisk are required
            </p>
          </div>

        </div>
        
        {/* Sticky Action Buttons for Mobile */}
        <div className="sticky-actions">
          <button 
            type="button"
            onClick={() => {
              localStorage.setItem('autoSavedResume', JSON.stringify(resume));
              alert('Resume saved successfully!');
            }}
            className="sticky-btn save-btn"
          >
            💾 Save Draft
          </button>
          <button 
            onClick={handleGenerateClick}
            disabled={isGenerating}
            className="sticky-btn generate-btn"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 size={18} />
                Generate Resume (₹79)
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentConfirm={handlePaymentConfirm}
        amount={79}
      />
      </div>
    </>
  );
}

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  onAdd?: () => void;
  collapsible?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface SortableFormSectionProps extends FormSectionProps {
  id: string;
}

function SortableFormSection({ id, title, children, onAdd, collapsible = true, isCollapsed = false, onToggleCollapse }: SortableFormSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={`form-section ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="form-section-header">
        <div className="section-header-left" {...attributes} {...listeners} style={{ cursor: 'move' }}>
          <h2 className="form-section-title">{title}</h2>
        </div>
        <div className="section-header-right">
          {onAdd && (
            <button onClick={onAdd} className="form-add-btn" type="button">
              <Plus size={18} />
            </button>
          )}
          {collapsible && onToggleCollapse && (
            <button 
              onClick={onToggleCollapse} 
              className="form-collapse-btn"
              type="button"
              aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
            >
              {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
          )}
        </div>
      </div>
      {!isCollapsed && <div className="form-section-content">{children}</div>}
    </div>
  );
}

function FormSection({ title, children, onAdd, collapsible = true, isCollapsed = false, onToggleCollapse }: FormSectionProps) {
  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAdd) {
      onAdd();
    }
  };

  return (
    <div className={`form-section ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="form-section-header">
        <h2 className="form-section-title">{title}</h2>
        <div className="section-header-right">
          {onAdd && (
            <button onClick={handleAdd} className="form-add-btn" type="button">
              <Plus size={18} />
            </button>
          )}
          {collapsible && onToggleCollapse && (
            <button 
              onClick={onToggleCollapse} 
              className="form-collapse-btn"
              type="button"
              aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
            >
              {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
          )}
        </div>
      </div>
      {!isCollapsed && <div className="form-section-content">{children}</div>}
    </div>
  );
}

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'tel' | 'url';
  validation?: 'email' | 'phone' | 'url';
}

function FormInput({ label, value, onChange, placeholder, required = false, type = 'text', validation }: FormInputProps) {
  const [isTouched, setIsTouched] = useState(false);
  
  // Validation logic
  const isValid = () => {
    if (!value && required) return false;
    if (!value) return true; // Empty non-required field is valid
    
    if (validation === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }
    
    if (validation === 'phone') {
      const phoneRegex = /^[\d\s\-+()]+$/;
      return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
    }
    
    if (validation === 'url') {
      try {
        new URL(value);
        return true;
      } catch {
        return value.startsWith('www.') || value.includes('.');
      }
    }
    
    return true;
  };
  
  const valid = isValid();
  const showValidation = isTouched && value;
  
  // Helper text for validation
  const getHelperText = () => {
    if (!isTouched || !value) return '';
    if (valid) return '';
    
    if (validation === 'email') return 'Please enter a valid email address';
    if (validation === 'phone') return 'Please enter a valid phone number (min 10 digits)';
    if (validation === 'url') return 'Please enter a valid URL';
    if (required && !value) return 'This field is required';
    
    return '';
  };
  
  return (
    <div className="form-input-group">
      <label className="form-label">
        {label}
        {required && <span className="required-indicator">*</span>}
      </label>
      <div className="input-wrapper">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setIsTouched(true)}
          className={`form-input ${showValidation ? (valid ? 'input-valid' : 'input-invalid') : ''}`}
          placeholder={placeholder}
        />
        {showValidation && (
          <span className="validation-icon">
            {valid ? (
              <Check size={20} className="icon-valid" />
            ) : (
              <AlertCircle size={20} className="icon-invalid" />
            )}
          </span>
        )}
      </div>
      {getHelperText() && (
        <span className="helper-text error-text">{getHelperText()}</span>
      )}
    </div>
  );
}

interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
}

function FormTextarea({ label, value, onChange, placeholder, maxLength = 500, required = false }: FormTextareaProps) {
  const currentLength = value.length;
  const percentFilled = (currentLength / maxLength) * 100;
  const isOverLimit = currentLength > maxLength;
  
  return (
    <div className="form-input-group">
      <label className="form-label">
        {label}
        {required && <span className="required-indicator">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className={`form-textarea ${isOverLimit ? 'input-invalid' : ''}`}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      <div className="character-count">
        <span className={currentLength > maxLength * 0.9 ? 'count-warning' : ''}>
          {currentLength} / {maxLength} characters
        </span>
        <div className="count-bar">
          <div 
            className={`count-fill ${percentFilled > 90 ? 'fill-warning' : ''} ${isOverLimit ? 'fill-error' : ''}`}
            style={{ width: `${Math.min(percentFilled, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}