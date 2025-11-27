import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { certificateApi } from "../services/backendApi";
import { Loader2 } from "lucide-react";
import ResumeAppBar from "../components/ResumeAppBar";
import LogoutButton from "../components/LogoutButton";
import "./CertificateGeneratorPage.css";

interface CertificateFormData {
  name: string;
  email: string;
  courseName: string;
  fromDate: string;
  toDate: string;
}

const CertificateGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CertificateFormData>();
  const [certificateHTML, setCertificateHTML] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [shareableUrl, setShareableUrl] = useState<string>("");
  const [certificateData, setCertificateData] = useState<CertificateFormData | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

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

  const onSubmit = async (data: CertificateFormData) => {
    try {
      setLoading(true);
      setError("");

      // Call the certificate generation API with authenticated request
      const response = await certificateApi.generateCertificate(data);

      setCertificateHTML(response);
      setCertificateData(data);
    } catch (err: any) {
      console.error("Error generating certificate:", err);
      setError(err.message || "Failed to generate certificate. Please try again.");
    } finally {
      setLoading(false);
      reset();
    }
  };

  // Function to generate shareable link
  const generateShareableLink = async () => {
    if (!certificateData || !certificateHTML) return;
    
    try {
      setLoading(true);
      setError("");

      const result = await certificateApi.saveCertificate({
        ...certificateData,
        html: certificateHTML,
      });

      const fullUrl = `${window.location.origin}/certificate/${result.certificateId}`;
      setShareableUrl(fullUrl);
    } catch (err: any) {
      console.error("Error generating shareable link:", err);
      setError(err.message || "Failed to generate shareable link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to copy link to clipboard
  const copyToClipboard = async () => {
    if (!shareableUrl) return;

    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Failed to copy link to clipboard");
    }
  };

  // Function to download certificate as PDF
  const downloadPDF = () => {
    const element = document.getElementById("certificate-container");
    if (!element) return;

    const opt = {
      margin: 0,
      filename: "certificate.pdf",
      image: { type: "jpeg" as const, quality: 0.75 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      },
      jsPDF: {
        unit: "in" as const,
        format: "letter" as const,
        orientation: "landscape" as const,
        compress: true,
      },
    };
    html2pdf().set(opt).from(element).save();
  };

  // If certificate is generated, show it instead of form
  if (certificateHTML) {
    return (
      <div className="certificate-page">
        <div className="certificate-container">
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <button
              onClick={downloadPDF}
              className="download-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="download-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Download PDF
            </button>

            {!shareableUrl && (
              <button
                onClick={generateShareableLink}
                disabled={loading}
                className="download-button"
                style={{ backgroundColor: '#10b981' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="spinner icon" style={{ width: '20px', height: '20px' }} />
                    Generating Link...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      style={{ width: '20px', height: '20px', marginRight: '8px' }}
                    >
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    Generate Shareable Link
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => {
                setCertificateHTML("");
                setShareableUrl("");
                setCertificateData(null);
              }}
              className="back-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Generate Another Certificate
            </button>
          </div>

          {/* Shareable Link Section */}
          {shareableUrl && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#166534',
                marginBottom: '8px' 
              }}>
                📎 Shareable Certificate Link
              </h3>
              <p style={{ fontSize: '14px', color: '#15803d', marginBottom: '12px' }}>
                Share this link with others to let them view your certificate:
              </p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={shareableUrl}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #86efac',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                />
                <button
                  onClick={copyToClipboard}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: copySuccess ? '#22c55e' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  {copySuccess ? '✓ Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message" style={{ marginBottom: '20px' }}>
              <p className="error-text">{error}</p>
            </div>
          )}

          {/* Header */}
          <h2 className="success-message">
            🎉 Certificate Generated Successfully!
          </h2>

          {/* Certificate Container */}
          <div
            id="certificate-container"
            className="certificate-display"
            dangerouslySetInnerHTML={{ __html: certificateHTML }}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <ResumeAppBar onNav={handleNavigation} rightAction={<LogoutButton />} />
      <div className="certificate-page" style={{ marginTop: '64px' }}>
        <div className="certificate-form-container">
        <h2 className="certificate-title">
          Generate Certificate
        </h2>
        <p className="certificate-subtitle">
          Fill in the details to create your certificate
        </p>

        {error && (
          <div className="error-message">
            <p className="error-text">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="certificate-form">
          <div className="form-group">
            <label className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              className="form-input"
              placeholder="Enter full name"
              disabled={loading}
            />
            {errors.name && (
              <p className="input-error">{errors.name.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className="form-input"
              placeholder="Enter email address"
              disabled={loading}
            />
            {errors.email && (
              <p className="input-error">{errors.email.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Course Name <span className="required">*</span>
            </label>
            <input
              type="text"
              {...register("courseName", { required: "Course name is required" })}
              className="form-input"
              placeholder="Enter course name"
              disabled={loading}
            />
            {errors.courseName && (
              <p className="input-error">
                {errors.courseName.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              From Date <span className="required">*</span>
            </label>
            <input
              type="date"
              {...register("fromDate", { required: "From date is required" })}
              className="form-input"
              disabled={loading}
            />
            {errors.fromDate && (
              <p className="input-error">
                {errors.fromDate.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              To Date <span className="required">*</span>
            </label>
            <input
              type="date"
              {...register("toDate", { required: "To date is required" })}
              className="form-input"
              disabled={loading}
            />
            {errors.toDate && (
              <p className="input-error">{errors.toDate.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? (
              <>
                <Loader2 className="spinner icon" />
                Generating...
              </>
            ) : (
              "Generate Certificate"
            )}
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

export default CertificateGeneratorPage;
