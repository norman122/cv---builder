import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { PdfDocument } from './pdf.jsx';

export async function downloadPDF(cvData, theme) {
  const filename = `${cvData.personalInfo.fullName.replace(/\s+/g, '_') || 'My'}_CV.pdf`;
  const blob = await pdf(React.createElement(PdfDocument, { cvData, theme })).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}