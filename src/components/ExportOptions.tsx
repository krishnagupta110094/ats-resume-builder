import React, { useState } from 'react';
import { Download, FileText, File, Loader2 } from 'lucide-react';
import { ExportService } from '../services/exportService';
import './ExportOptions.css';

interface ExportOptionsProps {
  resumeData: any;
  resumeElementId: string;
  fileName?: string;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({
  resumeData,
  resumeElementId,
  fileName = 'resume'
}) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting('pdf');
    try {
      await ExportService.exportToPDF(resumeElementId, `${fileName}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(null);
      setShowMenu(false);
    }
  };

  const handleExportWord = async () => {
    setIsExporting('word');
    try {
      await ExportService.exportToWord(resumeData, `${fileName}.docx`);
    } catch (error) {
      console.error('Word export failed:', error);
    } finally {
      setIsExporting(null);
      setShowMenu(false);
    }
  };

  const handleExportText = async () => {
    setIsExporting('text');
    try {
      await ExportService.exportToText(resumeData, `${fileName}.txt`);
    } catch (error) {
      console.error('Text export failed:', error);
    } finally {
      setIsExporting(null);
      setShowMenu(false);
    }
  };

  return (
    <div className="export-options-container">
      <button 
        className="export-main-btn"
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting !== null}
      >
        {isExporting ? (
          <>
            <Loader2 className="spinner-icon" />
            Exporting...
          </>
        ) : (
          <>
            <Download size={20} />
            Download Resume
          </>
        )}
      </button>

      {showMenu && (
        <>
          <div className="export-backdrop" onClick={() => setShowMenu(false)} />
          <div className="export-menu">
            <div className="export-menu-header">
              <h3 className="export-menu-title">Choose Format</h3>
              <button 
                className="export-close-btn"
                onClick={() => setShowMenu(false)}
              >
                ✕
              </button>
            </div>

            <div className="export-options-grid">
              <button
                className="export-option-btn"
                onClick={handleExportPDF}
                disabled={isExporting === 'pdf'}
              >
                <div className="export-option-icon pdf">
                  {isExporting === 'pdf' ? (
                    <Loader2 className="spinner-icon" />
                  ) : (
                    <File size={32} />
                  )}
                </div>
                <div className="export-option-content">
                  <h4 className="export-option-title">PDF Document</h4>
                  <p className="export-option-desc">
                    Professional format, best for printing and sharing
                  </p>
                </div>
                <div className="export-option-badge">Recommended</div>
              </button>

              <button
                className="export-option-btn"
                onClick={handleExportWord}
                disabled={isExporting === 'word'}
              >
                <div className="export-option-icon word">
                  {isExporting === 'word' ? (
                    <Loader2 className="spinner-icon" />
                  ) : (
                    <FileText size={32} />
                  )}
                </div>
                <div className="export-option-content">
                  <h4 className="export-option-title">Word Document</h4>
                  <p className="export-option-desc">
                    Editable format, perfect for further customization
                  </p>
                </div>
              </button>

              <button
                className="export-option-btn"
                onClick={handleExportText}
                disabled={isExporting === 'text'}
              >
                <div className="export-option-icon text">
                  {isExporting === 'text' ? (
                    <Loader2 className="spinner-icon" />
                  ) : (
                    <FileText size={32} />
                  )}
                </div>
                <div className="export-option-content">
                  <h4 className="export-option-title">Plain Text</h4>
                  <p className="export-option-desc">
                    Simple format, compatible with ATS systems
                  </p>
                </div>
              </button>
            </div>

            <div className="export-menu-footer">
              <p className="export-tip">
                💡 <strong>Tip:</strong> PDF format is recommended for most job applications
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportOptions;
