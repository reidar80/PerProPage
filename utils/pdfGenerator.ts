import { jsPDF } from "jspdf";
import { ResumeData, Language } from "../types";
import { UI_TRANSLATIONS } from "../constants";

export const generatePDF = async (
  data: ResumeData, 
  language: Language, 
  summary: string, 
  profileImageBase64?: string
) => {
  const doc = new jsPDF();
  const t = UI_TRANSLATIONS;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Fonts
  doc.setFont("helvetica", "normal");

  // Helper for page breaks
  const checkPageBreak = (heightNeeded: number) => {
    if (y + heightNeeded > 280) {
      doc.addPage();
      y = 20;
    }
  };

  // --- HEADER ---
  // Image (Left)
  if (profileImageBase64) {
    try {
      // Add image (approx 30x30mm)
      doc.addImage(profileImageBase64, "JPEG", margin, y, 30, 30);
    } catch (e) {
      console.warn("Could not add image to PDF", e);
    }
  }

  // Text info (Right of image)
  const textX = margin + 35;
  
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(data.contact.name, textX, y + 8);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  doc.text(data.contact.title[language], textX, y + 15);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`${data.contact.email} | ${data.contact.mobile}`, textX, y + 22);
  doc.text(data.contact.location, textX, y + 27);
  doc.textWithLink("LinkedIn Profile", textX, y + 32, { url: data.contact.linkedin });

  y += 40;

  // --- PRESENTATION (AI Generated) ---
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(t.pdf_profile_header[language], margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Wrap text
  const splitSummary = doc.splitTextToSize(summary, pageWidth - (margin * 2));
  doc.text(splitSummary, margin, y);
  y += (splitSummary.length * 5) + 10;

  // --- WORK EXPERIENCE ---
  checkPageBreak(30);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(t.experience_history[language], margin, y);
  y += 8;

  data.employmentHistory.forEach((job) => {
    checkPageBreak(25);
    
    // Line 1: Company (Bold) - Date (Right aligned)
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(job.company, margin, y);
    
    doc.setFont("helvetica", "normal");
    const startDate = job.startDate.substring(0, 7); // YYYY-MM
    const endDate = job.endDate === 'Present' ? t.present[language] : job.endDate.substring(0, 7);
    const dateStr = `${startDate} - ${endDate}`;
    
    doc.setFontSize(10);
    doc.text(dateStr, pageWidth - margin - doc.getTextWidth(dateStr), y);
    
    y += 5;

    // Line 2: Role (Italic)
    doc.setFont("helvetica", "italic");
    doc.text(job.role[language], margin, y);
    y += 5;

    // Line 3: Description (Normal)
    if (job.description) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const desc = job.description[language];
      const splitDesc = doc.splitTextToSize(desc, pageWidth - (margin * 2));
      doc.text(splitDesc, margin, y);
      y += (splitDesc.length * 4) + 6; // spacing
      doc.setTextColor(0, 0, 0);
    } else {
      y += 6;
    }
  });

  y += 5;

  // --- EDUCATION ---
  checkPageBreak(30);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(t.education[language], margin, y);
  y += 8;

  data.education.forEach((edu) => {
    checkPageBreak(20);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(edu.institution, margin, y);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(edu.period, pageWidth - margin - doc.getTextWidth(edu.period), y);
    
    y += 5;
    doc.setFont("helvetica", "italic");
    doc.text(edu.degree[language], margin, y);
    y += 8;
  });

  y += 5;

  // --- CERTIFICATIONS ---
  checkPageBreak(30);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setFont("helvetica", "bold");
  doc.text(t.certifications[language], margin, y);
  y += 8;

  data.certifications.forEach((cert) => {
    checkPageBreak(15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    // Bullet point
    doc.text(`• ${cert.name}`, margin, y);
    y += 5;
    if (cert.description) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(80,80,80);
        const splitDesc = doc.splitTextToSize(cert.description[language], pageWidth - (margin * 2) - 5);
        doc.text(splitDesc, margin + 5, y);
        y += (splitDesc.length * 4) + 3;
        doc.setTextColor(0,0,0);
    }
  });
  
  y += 5;

   // --- PROJECTS (Compact) ---
  checkPageBreak(30);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(t.key_projects[language], margin, y);
  y += 8;
  
  data.projects.slice(0, 10).forEach((proj) => { // Limit to top 10 to save space if many
     checkPageBreak(12);
     doc.setFontSize(10);
     doc.setFont("helvetica", "bold");
     doc.text(proj.name, margin, y);
     
     doc.setFont("helvetica", "normal");
     doc.text(proj.year, pageWidth - margin - doc.getTextWidth(proj.year), y);
     y += 5;
     
     // Short desc
     doc.setFontSize(9);
     doc.setTextColor(80,80,80);
     const shortDesc = doc.splitTextToSize(proj.description[language], pageWidth - (margin * 2));
     doc.text(shortDesc, margin, y);
     y += (shortDesc.length * 4) + 4;
     doc.setTextColor(0,0,0);
  });

  doc.save("Reidar_Boldevin_CV.pdf");
};