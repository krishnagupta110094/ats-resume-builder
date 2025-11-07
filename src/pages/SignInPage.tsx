import React, { useState } from 'react';
import { Eye, EyeOff, Briefcase, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

interface SignInPageProps {
  onToggleMode?: () => void;
}

const SignInPage: React.FC<SignInPageProps> = ({ onToggleMode }) => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Phone is optional
    if (formData.phone && formData.phone.length > 0 && formData.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      handleLogin();
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // Use real backend authentication
      const success = await signIn(formData.email, formData.password, formData.phone);

      if (success) {
        console.log('Login successful:', formData.email);
        // Redirect to the page they were trying to access, or default to builder
        const from = location.state?.from?.pathname || '/builder';
        navigate(from, { replace: true });
      } else {
        setErrors({ 
          email: 'Invalid email or password. Please check your credentials.',
          password: 'Invalid email or password. Please check your credentials.'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        email: 'Login failed. Please check your credentials and try again.',
        password: 'Login failed. Please check your credentials and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };



  return (
    <div className="auth-container">
      <div className="auth-grid">
        <div className="branding-section">
          <div className="brand-header">
            <div className="brand-icon">
              <Briefcase className="icon-large" />
            </div>
            <h1 className="brand-title">Resume Builder</h1>
            <p className="brand-subtitle">
              Create professional resumes that get noticed by recruiters
            </p>
          </div>

          <div className="features-list">
            <div className="feature-item">
              <CheckCircle className="feature-icon" />
              <div className="feature-content">
                <h3 className="feature-title">Professional Templates</h3>
                <p className="feature-description">
                  Choose from modern, industry-specific templates designed by HR experts
                </p>
              </div>
            </div>

            <div className="feature-item">
              <CheckCircle className="feature-icon" />
              <div className="feature-content">
                <h3 className="feature-title">Real-time Analysis</h3>
                <p className="feature-description">
                  Get instant feedback and suggestions to improve your resume's effectiveness
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="form-container">
          <div className="form-content">
            <div className="form-header">
              <h2 className="form-title">Welcome Back</h2>
              <p className="form-subtitle">
                Sign in to your account to continue building your perfect resume
              </p>

            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <div className="error-message">{errors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <div className="error-message">{errors.phone}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input password-input"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? (
                      <EyeOff className="eye-icon" />
                    ) : (
                      <Eye className="eye-icon" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="checkbox"
                  />
                  <span className="checkbox-text">Remember me</span>
                </label>
                <a href="#" className="forgot-link">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>




            {onToggleMode && (
              <div className="toggle-text">
                Don't have an account?{' '}
                <button type="button" onClick={onToggleMode} className="toggle-button">
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;