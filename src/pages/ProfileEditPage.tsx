import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Save, X, Loader2, CheckCircle } from 'lucide-react';
import { userApi } from '../services/backendApi';
import LogoutButton from '../components/LogoutButton';
import ResumeAppBar from '../components/ResumeAppBar';
import './ProfileEditPage.css';

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [originalData, setOriginalData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
    loadUserProfile();
  }, []);

  useEffect(() => {
    // Check if there are any changes
    const changed = 
      formData.name !== originalData.name ||
      formData.email !== originalData.email ||
      formData.phone !== originalData.phone;
    setHasChanges(changed);
  }, [formData, originalData]);

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      // Try to load from backend /me endpoint
      const userData = await userApi.getCurrentUser();
      const profileData = {
        name: userData.name || '',
        email: userData.email || '',
        phone: '' // Backend might not have phone
      };
      setFormData(profileData);
      setOriginalData(profileData);
    } catch (error) {
      console.log('Backend failed, using localStorage');
      // Fallback to localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const profileData = {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || ''
        };
        setFormData(profileData);
        setOriginalData(profileData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    // Validation
    if (!formData.name.trim()) {
      setMessage('Name is required');
      return;
    }

    if (!formData.email.trim()) {
      setMessage('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage('Please enter a valid email address');
      return;
    }

    if (formData.phone && formData.phone.length > 0 && formData.phone.length < 10) {
      setMessage('Please enter a valid phone number');
      return;
    }

    setIsSaving(true);

    try {
      // TODO: When backend has update profile endpoint, use it
      // For now, update localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const updatedUser = {
          ...user,
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setOriginalData(formData);
        setIsSuccess(true);
        setMessage('Profile updated successfully!');
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <>
        <LogoutButton />
        <div className="profile-loading">
          <Loader2 size={48} className="spinner" />
          <p>Loading your profile...</p>
        </div>
      </>
    );
  }

  if (isSuccess) {
    return (
      <>
        <LogoutButton />
        <div className="profile-success">
          <div className="success-card">
            <div className="success-icon-wrapper">
              <CheckCircle className="success-icon" />
            </div>
            <h2 className="success-title">Profile Updated!</h2>
            <p className="success-message">
              Your profile has been updated successfully. Redirecting to dashboard...
            </p>
            <div className="spinner"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ResumeAppBar onNav={handleNavigation} rightAction={<LogoutButton />} />
      <div className="profile-edit-page" style={{ marginTop: '64px' }}>
        <div className="profile-edit-container">
          <div className="profile-edit-header">
            <div className="profile-icon-wrapper">
              <User className="profile-icon" />
            </div>
            <h2 className="profile-main-title">Edit Profile</h2>
            <p className="profile-subtitle">Update your personal information</p>
          </div>

          <div className="profile-edit-card">
            <form onSubmit={handleSave} className="profile-edit-form">
              {message && !isSuccess && (
                <div className={`alert-box ${message.includes('success') ? 'alert-info' : 'alert-error'}`}>
                  <div className="alert-text">{message}</div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name *
                </label>
                <div className="input-wrapper">
                  <User className="input-icon-left" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address *
                </label>
                <div className="input-wrapper">
                  <Mail className="input-icon-left" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <div className="input-wrapper">
                  <Phone className="input-icon-left" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your phone number"
                  />
                </div>
                <p className="form-hint">Optional - Your contact number</p>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={isSaving || !hasChanges}
                  className="submit-btn"
                >
                  {isSaving ? (
                    <>
                      <div className="spinner"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="cancel-btn-secondary"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>

              {hasChanges && (
                <div className="unsaved-changes-notice">
                  ⚠️ You have unsaved changes
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileEditPage;
