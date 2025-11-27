import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { certificateApi } from "../services/backendApi";
import { Loader2 } from "lucide-react";
import html2pdf from "html2pdf.js";
import "./CertificateGeneratorPage.css";

const PublicCertificateView: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();
  const [certificateHTML, setCertificateHTML] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!certificateId) {
        setError("Invalid certificate ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result = await certificateApi.getCertificateById(certificateId);
        setCertificateHTML(result.html);
      } catch (err: any) {
        console.error("Error loading certificate:", err);
        setError(err.message || "Failed to load certificate. It may have expired or doesn't exist.");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

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

  if (loading) {
    return (
      <div className="certificate-page" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="spinner" style={{ 
            width: '48px', 
            height: '48px', 
            color: '#6366f1',
            margin: '0 auto 16px'
          }} />
          <p style={{ fontSize: '18px', color: '#64748b' }}>Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="certificate-page" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div style={{ 
          textAlign: 'center', 
          maxWidth: '500px',
          padding: '40px',
          backgroundColor: '#fee2e2',
          borderRadius: '12px',
          border: '1px solid #fca5a5'
        }}>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '16px' 
          }}>
            ❌
          </div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#991b1b',
            marginBottom: '12px' 
          }}>
            Certificate Not Found
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: '#dc2626',
            marginBottom: '24px' 
          }}>
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="certificate-page">
      <div className="certificate-container">
        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
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
        </div>

        {/* Info Banner */}
        <div style={{
          background: '#e0e7ff',
          border: '1px solid #a5b4fc',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <p style={{ 
            fontSize: '14px', 
            color: '#3730a3',
            margin: 0 
          }}>
            📜 This is a publicly shared certificate. You can download it as a PDF.
          </p>
        </div>

        {/* Header */}
        <h2 className="success-message">
          Certificate of Completion
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
};

export default PublicCertificateView;
