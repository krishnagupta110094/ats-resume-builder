import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience?: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    location?: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills?: string[];
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string;
    link?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

export class ExportService {
  /**
   * Export resume as PDF using html2canvas and jsPDF
   */
  static async exportToPDF(elementId: string, fileName: string = 'resume.pdf'): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Resume element not found');
      }

      // Show loading indicator
      const loadingToast = document.createElement('div');
      loadingToast.textContent = 'Generating PDF...';
      loadingToast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        z-index: 10000;
        font-weight: 600;
      `;
      document.body.appendChild(loadingToast);

      // Capture the element as canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Add image to PDF (handling multiple pages if needed)
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(fileName);

      // Remove loading indicator
      document.body.removeChild(loadingToast);

      // Show success message
      this.showToast('PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      this.showToast('Failed to export PDF. Please try again.', 'error');
      throw error;
    }
  }

  /**
   * Export resume as Word document (.docx)
   */
  static async exportToWord(resumeData: ResumeData, fileName: string = 'resume.docx'): Promise<void> {
    try {
      const { personalInfo, summary, experience, education, skills, projects, certifications } = resumeData;

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Header - Name
              new Paragraph({
                text: personalInfo.name,
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 }
              }),

              // Contact Information
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${personalInfo.email} | ${personalInfo.phone}`,
                    size: 20
                  }),
                  ...(personalInfo.location ? [
                    new TextRun({ text: ' | ', size: 20 }),
                    new TextRun({ text: personalInfo.location, size: 20 })
                  ] : []),
                  ...(personalInfo.linkedin ? [
                    new TextRun({ text: ' | ', size: 20 }),
                    new TextRun({ text: personalInfo.linkedin, size: 20 })
                  ] : [])
                ],
                spacing: { after: 300 }
              }),

              // Summary
              ...(summary ? [
                new Paragraph({
                  text: 'PROFESSIONAL SUMMARY',
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 200, after: 100 }
                }),
                new Paragraph({
                  text: summary,
                  spacing: { after: 300 }
                })
              ] : []),

              // Experience
              ...(experience && experience.length > 0 ? [
                new Paragraph({
                  text: 'WORK EXPERIENCE',
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 200, after: 100 }
                }),
                ...experience.flatMap(exp => [
                  new Paragraph({
                    children: [
                      new TextRun({ text: exp.title, bold: true, size: 24 }),
                      new TextRun({ text: ' | ', size: 24 }),
                      new TextRun({ text: exp.company, italics: true, size: 24 })
                    ],
                    spacing: { before: 100 }
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ 
                        text: `${exp.startDate} - ${exp.endDate}`,
                        size: 20,
                        color: '666666'
                      }),
                      ...(exp.location ? [
                        new TextRun({ text: ' | ', size: 20, color: '666666' }),
                        new TextRun({ text: exp.location, size: 20, color: '666666' })
                      ] : [])
                    ],
                    spacing: { after: 50 }
                  }),
                  new Paragraph({
                    text: exp.description,
                    spacing: { after: 200 }
                  })
                ])
              ] : []),

              // Education
              ...(education && education.length > 0 ? [
                new Paragraph({
                  text: 'EDUCATION',
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 200, after: 100 }
                }),
                ...education.flatMap(edu => [
                  new Paragraph({
                    children: [
                      new TextRun({ text: edu.degree, bold: true, size: 24 }),
                      new TextRun({ text: ' | ', size: 24 }),
                      new TextRun({ text: edu.institution, italics: true, size: 24 })
                    ],
                    spacing: { before: 100 }
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ 
                        text: edu.graduationDate,
                        size: 20,
                        color: '666666'
                      }),
                      ...(edu.location ? [
                        new TextRun({ text: ' | ', size: 20, color: '666666' }),
                        new TextRun({ text: edu.location, size: 20, color: '666666' })
                      ] : []),
                      ...(edu.gpa ? [
                        new TextRun({ text: ' | GPA: ', size: 20, color: '666666' }),
                        new TextRun({ text: edu.gpa, size: 20, color: '666666' })
                      ] : [])
                    ],
                    spacing: { after: 200 }
                  })
                ])
              ] : []),

              // Skills
              ...(skills && skills.length > 0 ? [
                new Paragraph({
                  text: 'SKILLS',
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 200, after: 100 }
                }),
                new Paragraph({
                  text: skills.join(' • '),
                  spacing: { after: 300 }
                })
              ] : []),

              // Projects
              ...(projects && projects.length > 0 ? [
                new Paragraph({
                  text: 'PROJECTS',
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 200, after: 100 }
                }),
                ...projects.flatMap(project => [
                  new Paragraph({
                    children: [
                      new TextRun({ text: project.name, bold: true, size: 24 })
                    ],
                    spacing: { before: 100 }
                  }),
                  new Paragraph({
                    text: project.description,
                    spacing: { after: 50 }
                  }),
                  ...(project.technologies ? [
                    new Paragraph({
                      children: [
                        new TextRun({ text: 'Technologies: ', bold: true, size: 20 }),
                        new TextRun({ text: project.technologies, size: 20 })
                      ],
                      spacing: { after: 200 }
                    })
                  ] : [])
                ])
              ] : []),

              // Certifications
              ...(certifications && certifications.length > 0 ? [
                new Paragraph({
                  text: 'CERTIFICATIONS',
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 200, after: 100 }
                }),
                ...certifications.map(cert => 
                  new Paragraph({
                    children: [
                      new TextRun({ text: cert.name, bold: true, size: 22 }),
                      new TextRun({ text: ` - ${cert.issuer} (${cert.date})`, size: 22 })
                    ],
                    spacing: { after: 100 }
                  })
                )
              ] : [])
            ]
          }
        ]
      });

      // Generate and save the document
      const blob = await Packer.toBlob(doc);
      saveAs(blob, fileName);

      this.showToast('Word document downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error exporting to Word:', error);
      this.showToast('Failed to export Word document. Please try again.', 'error');
      throw error;
    }
  }

  /**
   * Export resume as plain text
   */
  static async exportToText(resumeData: ResumeData, fileName: string = 'resume.txt'): Promise<void> {
    try {
      const { personalInfo, summary, experience, education, skills, projects, certifications } = resumeData;

      let text = '';

      // Header
      text += `${personalInfo.name.toUpperCase()}\n`;
      text += `${'='.repeat(personalInfo.name.length)}\n\n`;
      text += `Email: ${personalInfo.email}\n`;
      text += `Phone: ${personalInfo.phone}\n`;
      if (personalInfo.location) text += `Location: ${personalInfo.location}\n`;
      if (personalInfo.linkedin) text += `LinkedIn: ${personalInfo.linkedin}\n`;
      if (personalInfo.website) text += `Website: ${personalInfo.website}\n`;
      text += '\n';

      // Summary
      if (summary) {
        text += 'PROFESSIONAL SUMMARY\n';
        text += '-'.repeat(20) + '\n';
        text += `${summary}\n\n`;
      }

      // Experience
      if (experience && experience.length > 0) {
        text += 'WORK EXPERIENCE\n';
        text += '-'.repeat(20) + '\n';
        experience.forEach(exp => {
          text += `\n${exp.title} | ${exp.company}\n`;
          text += `${exp.startDate} - ${exp.endDate}`;
          if (exp.location) text += ` | ${exp.location}`;
          text += '\n';
          text += `${exp.description}\n`;
        });
        text += '\n';
      }

      // Education
      if (education && education.length > 0) {
        text += 'EDUCATION\n';
        text += '-'.repeat(20) + '\n';
        education.forEach(edu => {
          text += `\n${edu.degree} | ${edu.institution}\n`;
          text += `${edu.graduationDate}`;
          if (edu.location) text += ` | ${edu.location}`;
          if (edu.gpa) text += ` | GPA: ${edu.gpa}`;
          text += '\n';
        });
        text += '\n';
      }

      // Skills
      if (skills && skills.length > 0) {
        text += 'SKILLS\n';
        text += '-'.repeat(20) + '\n';
        text += skills.join(' • ') + '\n\n';
      }

      // Projects
      if (projects && projects.length > 0) {
        text += 'PROJECTS\n';
        text += '-'.repeat(20) + '\n';
        projects.forEach(project => {
          text += `\n${project.name}\n`;
          text += `${project.description}\n`;
          if (project.technologies) text += `Technologies: ${project.technologies}\n`;
          if (project.link) text += `Link: ${project.link}\n`;
        });
        text += '\n';
      }

      // Certifications
      if (certifications && certifications.length > 0) {
        text += 'CERTIFICATIONS\n';
        text += '-'.repeat(20) + '\n';
        certifications.forEach(cert => {
          text += `• ${cert.name} - ${cert.issuer} (${cert.date})\n`;
        });
      }

      // Create and download file
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, fileName);

      this.showToast('Text file downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error exporting to text:', error);
      this.showToast('Failed to export text file. Please try again.', 'error');
      throw error;
    }
  }

  /**
   * Show toast notification
   */
  private static showToast(message: string, type: 'success' | 'error' = 'success'): void {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'success' 
        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
      };
      color: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      font-weight: 600;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}
