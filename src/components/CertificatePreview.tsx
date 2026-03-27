import { Download, Printer } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { PatientRecord } from '../types';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface CertificatePreviewProps {
  record: Partial<PatientRecord>;
}

export default function CertificatePreview({ record }: CertificatePreviewProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  // Preload logo and convert to base64 to ensure it works in PDF/Print
  React.useEffect(() => {
    const logoUrl = "https://upload.wikimedia.org/wikipedia/en/5/5e/Kathmandu_Medical_College_Logo.png";
    const fallbackUrl = "https://kmc.edu.np/wp-content/uploads/2023/06/kmc-logo.png";

    const convertToBase64 = (url: string): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.setAttribute('crossOrigin', 'anonymous');
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL('image/png'));
            } else {
              resolve('');
            }
          } catch (e) {
            console.error("Canvas conversion error", e);
            resolve('');
          }
        };
        img.onerror = () => resolve('');
        img.src = url;
      });
    };

    const loadLogo = async () => {
      let base64 = await convertToBase64(logoUrl);
      if (!base64) base64 = await convertToBase64(fallbackUrl);
      if (base64) setLogoBase64(base64);
    };

    loadLogo();
  }, []);

  const handlePrint = () => {
    if (!certificateRef.current) return;
    
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(style => style.outerHTML)
      .join('\n');

    const content = certificateRef.current.innerHTML;
    
    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.write(`
      <html>
        <head>
          <title>Medical Certificate - ${record.patientName || 'Patient'}</title>
          ${styles}
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            body { 
              margin: 0; 
              padding: 0; 
              background: white !important;
              font-family: 'Inter', sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-wrapper {
              width: 210mm;
              height: 297mm;
              margin: 0 auto;
              background: white;
            }
            @page {
              size: A4;
              margin: 0;
            }
            @media print {
              body { margin: 0; }
              .print-wrapper { margin: 0; border: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-wrapper">
            ${content}
          </div>
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 1000);
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    
    setIsExporting(true);
    const element = certificateRef.current;
    
    // Standard A4 dimensions in mm
    const a4WidthMm = 210;
    const a4HeightMm = 297;

    // Standard A4 dimensions at 96 DPI for html2canvas
    const a4WidthPx = 794;
    const a4HeightPx = 1123;

    const opt = {
      margin: 0,
      filename: `KMC_Certificate_${record.patientName?.replace(/\s+/g, '_') || 'Patient'}.pdf`,
      image: { type: 'png' as const, quality: 1.0 }, // Use PNG for lossless quality
      html2canvas: { 
        scale: 4, // Increased scale for even sharper text and graphics
        useCORS: true,
        allowTaint: false,
        letterRendering: true,
        logging: false,
        width: a4WidthPx,
        height: a4HeightPx,
        windowWidth: a4WidthPx,
        windowHeight: a4HeightPx,
        scrollY: 0,
        scrollX: 0,
        backgroundColor: '#ffffff',
        imageTimeout: 0, // Wait indefinitely for images to load
        dpi: 300, // Explicitly set high DPI
        onclone: (clonedDoc: Document) => {
          // Ensure fonts are applied correctly in the cloned document
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            * {
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' as const,
        compress: true,
        precision: 16 // Higher precision for layout calculations
      },
      pagebreak: { mode: 'avoid-all' }
    };

    try {
      // Ensure fonts are loaded before starting
      if (document.fonts) {
        await document.fonts.ready;
      }

      // Create a temporary container for the capture
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = `${a4WidthPx}px`;
      container.style.height = `${a4HeightPx}px`;
      container.style.backgroundColor = 'white';
      container.style.zIndex = '-1';
      
      // Clone the element
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.width = `${a4WidthPx}px`;
      clone.style.height = `${a4HeightPx}px`;
      clone.style.margin = '0';
      clone.style.padding = '0';
      clone.style.border = 'none';
      clone.style.boxShadow = 'none';
      clone.style.transform = 'none';
      clone.style.display = 'flex';
      clone.style.flexDirection = 'column';
      
      // Ensure the inner template div is also styled correctly in the clone
      const innerTemplate = clone.querySelector('.certificate-root') as HTMLElement;
      if (innerTemplate) {
        innerTemplate.style.width = '100%';
        innerTemplate.style.height = '100%';
        innerTemplate.style.minHeight = '100%';
        innerTemplate.style.border = 'none';
        innerTemplate.style.boxShadow = 'none';
        innerTemplate.style.margin = '0';
        innerTemplate.style.padding = '12mm'; // Standard medical certificate padding
      }

      container.appendChild(clone);
      document.body.appendChild(container);

      // Wait for any potential re-renders or image loads in the clone
      // Also wait for a frame to ensure styles are applied
      await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 800)));

      await html2pdf().set(opt).from(clone).save();
      
      document.body.removeChild(container);
    } catch (error) {
      console.error('PDF Export Error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getPronoun = (gender?: string) => {
    if (gender === 'Male') return { subject: 'He', title: 'Mr.', possessive: 'his' };
    if (gender === 'Female') return { subject: 'She', title: 'Ms.', possessive: 'her' };
    return { subject: 'They', title: 'Mx.', possessive: 'their' };
  };

  const { subject, title, possessive } = getPronoun(record.gender);
  const templateId = record.templateId || 'standard';

  const Header = () => (
    <div className="flex items-start justify-between mb-10 border-b-4 border-blue-900/20 pb-8 relative">
      <div className="flex items-center gap-8">
        <div className="relative">
          {logoBase64 ? (
            <img 
              src={logoBase64} 
              alt="KMC Logo" 
              className="w-24 h-28 object-contain relative z-10"
            />
          ) : (
            <div className="w-24 h-28 bg-blue-50 rounded-xl flex flex-col items-center justify-center border-2 border-blue-100 relative z-10">
              <div className="w-12 h-12 border-4 border-blue-900/20 rounded-full mb-2 flex items-center justify-center">
                <span className="text-[8px] font-black text-blue-900/40">KMC</span>
              </div>
              <span className="text-[8px] text-blue-400 font-black uppercase tracking-tighter text-center px-2">Kathmandu Medical College</span>
            </div>
          )}
          <div className="absolute -inset-2 bg-blue-900/5 rounded-2xl blur-xl -z-0" />
        </div>
        <div className="text-left space-y-1">
          <h1 className="text-3xl font-black text-blue-900 leading-none tracking-tighter uppercase">
            Kathmandu Medical College<br/>
            <span className="text-2xl text-blue-800/90">Teaching Hospital</span>
          </h1>
          <div className="flex items-center gap-3 py-1">
            <div className="h-px w-8 bg-blue-900/30" />
            <p className="text-lg font-black text-blue-700 tracking-[0.2em] uppercase">Department of Nephrology</p>
          </div>
          <div className="flex flex-col text-xs text-neutral-500 font-bold uppercase tracking-widest leading-relaxed">
            <p>Sinamangal, Kathmandu, Nepal</p>
            <p className="text-[10px] text-neutral-400">Tel: +977-1-4476152, 4469064 | Email: info@kmc.edu.np</p>
          </div>
        </div>
      </div>
      <div className="text-right hidden sm:block">
        <div className="bg-blue-900 text-white px-4 py-2 rounded-bl-2xl rounded-tr-lg shadow-lg shadow-blue-900/20">
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Official Document</p>
        </div>
        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-3">www.kmc.edu.np</p>
      </div>
    </div>
  );

  const Footer = () => (
    <div className="mt-auto pt-16 flex justify-between items-end relative z-10">
      <div className="space-y-1 text-left">
        <p className="mb-10 font-black text-neutral-400 uppercase tracking-[0.3em] text-[9px]">Authorized Signature</p>
        <div className="space-y-0.5">
          <p className="text-2xl font-black text-blue-900 tracking-tighter">{record.doctorName || '[Doctor Name]'}</p>
          <p className="font-black text-neutral-700 text-xs uppercase tracking-widest">{record.doctorDesignation || '[Designation]'}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-neutral-100 px-2 py-0.5 rounded text-[10px] font-bold text-neutral-500">NMC NO: {record.doctorNmc || '____'}</span>
          </div>
          <p className="text-neutral-400 text-[9px] font-bold uppercase tracking-[0.2em] mt-3">{record.doctorDepartment || 'Department of Nephrology'}</p>
        </div>
      </div>
      
      {/* Seal Space */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-blue-900/5 rounded-full" />
        <div className="absolute inset-2 border border-dashed border-blue-900/10 rounded-full" />
        <div className="text-[9px] text-blue-900/20 font-black uppercase text-center p-6 leading-tight rotate-12 select-none">
          Official Hospital Seal<br/>
          <span className="text-[7px]">KMC Teaching Hospital</span><br/>
          <span className="text-[7px]">Nephrology Department</span>
        </div>
      </div>
    </div>
  );

  const Body = () => (
    <div className="text-[17px] leading-[1.8] text-neutral-800 space-y-10 flex-grow text-justify font-medium relative z-10">
      <p className="first-letter:text-4xl first-letter:font-black first-letter:text-blue-900 first-letter:mr-1 first-letter:float-left">
        This is to certify that <span className="font-black text-blue-900 uppercase underline decoration-blue-900/20 underline-offset-8 decoration-2">{title} {record.patientName || '[Patient Name]'}</span>, 
        aged <span className="font-black text-blue-900">{record.age || '[Age]'} years</span>, {record.gender?.toLowerCase() || '[gender]'}, 
        permanent resident of <span className="font-bold text-neutral-900">{record.municipality || '[Municipality]'}–{record.wardNo || '[Ward]'}</span>, 
        <span className="font-bold text-neutral-900"> {record.district || '[District]'}</span>, Nepal, is a registered patient under the professional medical care of the Department of Nephrology at this institution.
      </p>

      <div className="space-y-8 bg-neutral-50/30 p-8 rounded-[32px] border border-neutral-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
          <span className="font-black text-blue-900 uppercase text-[11px] tracking-[0.2em] pt-1 min-w-[160px] opacity-60">Diagnosis:</span>
          <span className="font-black text-neutral-900 text-xl leading-tight">{record.diagnosis || 'Chronic Kidney Disease Stage V, Hypertension, and Type II Diabetes Mellitus'}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
          <span className="font-black text-blue-900 uppercase text-[11px] tracking-[0.2em] pt-1 min-w-[160px] opacity-60">Current Management:</span>
          <p className="leading-relaxed text-neutral-700">
            The patient has been on regular maintenance hemodialysis since 
            <span className="font-black text-blue-900 mx-1 px-2 py-0.5 bg-blue-50 rounded-lg border border-blue-100"> {record.dialysisStartDateBS || '2080/04/15'}</span> 
            {record.dialysisStartDateAD && <span className="text-neutral-400 text-sm">({record.dialysisStartDateAD})</span>}, administered twice/thrice weekly as per prescribed medical protocol.
          </p>
        </div>

        {record.transplantPlanned && (
          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 p-6 bg-blue-900 text-white rounded-2xl shadow-xl shadow-blue-900/20">
            <span className="font-black uppercase text-[11px] tracking-[0.2em] pt-1 min-w-[160px] opacity-70">Recommendation:</span>
            <p className="leading-relaxed font-bold">
              In view of {possessive} clinical condition and advanced renal failure, the patient has been advised to undergo Renal Transplantation. Pre-transplant evaluation and medical workup are currently underway.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 py-6">
        <div className="h-px flex-grow bg-neutral-100" />
        <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-[0.3em]">End of clinical summary</p>
        <div className="h-px flex-grow bg-neutral-100" />
      </div>

      <p className="text-neutral-500 text-sm font-medium italic">
        This certificate is issued upon the patient's request for official purposes.
      </p>
    </div>
  );

  const renderTemplate = () => {
    const commonClasses = "p-12 min-h-[1123px] w-full max-w-[794px] mx-auto flex flex-col print:p-[15mm] print:w-full print:min-h-screen print:mx-0 print:bg-white print:text-black bg-white relative overflow-hidden certificate-root";
    
    switch (templateId) {
      case 'modern':
      case 'standard':
      default:
        return (
          <div className={commonClasses}>
            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none -z-0">
              <div className="transform -rotate-45 scale-[2.5]">
                <h2 className="text-[180px] font-black uppercase tracking-tighter">KMC</h2>
              </div>
            </div>

            <Header />
            
            <div className="flex justify-between mb-12 text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] relative z-10">
              <div className="flex items-center gap-3">
                <span className="bg-neutral-100 px-2 py-1 rounded text-blue-900/40">REF NO:</span>
                <span className="text-neutral-900">{record.id?.slice(-8).toUpperCase() || 'KMC-PENDING'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-neutral-100 px-2 py-1 rounded text-blue-900/40">DATE:</span>
                <span className="text-neutral-900">{record.issueDateBS}</span>
              </div>
            </div>
            
            <div className="text-center mb-16 relative z-10">
              <h2 className="text-5xl font-black text-blue-900 uppercase tracking-tighter">
                Medical Certificate
              </h2>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-12 h-1 bg-blue-900/20 rounded-full" />
                <div className="w-4 h-1 bg-blue-900 rounded-full" />
                <div className="w-12 h-1 bg-blue-900/20 rounded-full" />
              </div>
            </div>

            <Body />
            
            <Footer />

            <div className="mt-12 pt-6 border-t border-neutral-100 flex justify-between items-center text-[9px] text-neutral-400 font-bold uppercase tracking-[0.2em]">
              <span>KMC Nephrology Management System</span>
              <span>Verification ID: {record.id || 'PENDING'}</span>
            </div>
          </div>
        );
      case 'classic':
        return (
          <div className={`${commonClasses} border-[16px] border-double border-blue-900/5`}>
            <Header />
            <div className="border-t-4 border-blue-900/20 my-6" />
            
            <div className="flex justify-between mb-12 italic text-neutral-600 font-serif">
              <span>Ref: _________</span>
              <span>Date: {record.issueDateBS}</span>
            </div>

            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold underline decoration-double underline-offset-[12px] uppercase tracking-widest text-blue-900 font-serif">
                Medical Certificate
              </h2>
            </div>

            <Body />
            
            <Footer />
          </div>
        );
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-4xl mx-auto print:shadow-none print:p-0 print:m-0 print:max-w-none print:bg-white">
      <div className="flex justify-end mb-6 print:hidden gap-4">
        <div className="flex flex-col items-end gap-2 text-right">
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center gap-2 bg-white border-2 border-neutral-900 text-neutral-900 px-6 py-3 rounded-2xl font-semibold hover:bg-neutral-50 transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-neutral-800 transition-all"
            >
              <Printer className="w-5 h-5" />
              Print Certificate
            </button>
          </div>
          <p className="text-[10px] text-neutral-400 max-w-[300px] leading-tight">
            Note: If the print dialog doesn't appear, please open the app in a new tab. 
            PDF export works best for digital sharing.
          </p>
        </div>
      </div>
      <div ref={certificateRef}>
        {renderTemplate()}
      </div>
    </div>
  );
}
