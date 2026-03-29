import { collection, onSnapshot, query } from 'firebase/firestore';
import { Download, Printer } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { HospitalSettings, PatientRecord } from '../types';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface CertificatePreviewProps {
  record: Partial<PatientRecord>;
}

export default function CertificatePreview({ record }: CertificatePreviewProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [hospitalSettings, setHospitalSettings] = useState<HospitalSettings>({
    name: 'Kathmandu Medical College Public Limited',
    department: 'Department of Nephrology',
    address: 'Sinamangal, Kathmandu, Nepal',
    phone: '+977-1-4476152, 4469064',
    logoUrl: 'https://kmc.edu.np/wp-content/uploads/2023/06/kmc-logo.png'
  });

  useEffect(() => {
    const q = query(collection(db, 'hospitalSettings'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const settings = snapshot.docs[0].data() as HospitalSettings;
        setHospitalSettings(settings);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'hospitalSettings');
    });
    return () => unsubscribe();
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

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Copy all style and link tags from the main document
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(style => style.outerHTML)
      .join('\n');

    const content = certificateRef.current.innerHTML;
    const rootClasses = certificateRef.current.className;
    
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Medical Certificate - ${record.patientName || 'Patient'}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
          ${styles}
          <style>
            @media print {
              @page {
                size: A4;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                background: white !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .print-wrapper {
                width: 210mm;
                min-height: 297mm;
                margin: 0;
                padding: 0;
                border: none;
                box-shadow: none;
                width: 100% !important;
              }
            }
            body {
              font-family: 'Inter', sans-serif;
              background: white;
              margin: 0;
              padding: 0;
            }
            .print-wrapper {
              width: 210mm;
              margin: 0 auto;
              background: white;
            }
          </style>
        </head>
        <body>
          <div class="print-wrapper ${rootClasses}">
            ${content}
          </div>
          <script>
            function doPrint() {
              window.print();
            }

            window.onload = () => {
              if (document.fonts) {
                document.fonts.ready.then(() => {
                  setTimeout(doPrint, 500);
                });
              } else {
                setTimeout(doPrint, 1000);
              }
            };
          </script>
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow?.addEventListener('afterprint', () => {
      document.body.removeChild(iframe);
    });
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
        innerTemplate.style.width = '210mm';
        innerTemplate.style.height = '297mm';
        innerTemplate.style.minHeight = '297mm';
        innerTemplate.style.maxHeight = '297mm';
        innerTemplate.style.border = 'none';
        innerTemplate.style.boxShadow = 'none';
        innerTemplate.style.margin = '0';
        innerTemplate.style.padding = '15mm'; // Standard medical certificate padding
        innerTemplate.style.overflow = 'hidden';
      }

      container.appendChild(clone);
      document.body.appendChild(container);

      // Wait for any potential re-renders or image loads in the clone
      // Also wait for a frame to ensure styles are applied
      await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 1000)));

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

  const Header = () => {
    const [logoSrc, setLogoSrc] = useState(hospitalSettings.logoUrl || "https://kmc.edu.np/wp-content/uploads/2023/06/kmc-logo.png");

    useEffect(() => {
      if (hospitalSettings.logoUrl) {
        setLogoSrc(hospitalSettings.logoUrl);
      }
    }, [hospitalSettings.logoUrl]);

    return (
      <div className="flex items-center justify-between mb-10 border-b-2 border-neutral-900 pb-6">
        <div className="w-32 flex justify-start">
          <div className="h-28 w-28 flex items-center justify-center overflow-hidden">
            <img 
              src={logoSrc} 
              alt="Hospital Logo" 
              className="h-full w-full object-contain"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={() => {
                if (logoSrc !== "https://kmc.edu.np/wp-content/uploads/2023/06/kmc-logo.png") {
                  setLogoSrc("https://kmc.edu.np/wp-content/uploads/2023/06/kmc-logo.png");
                } else if (logoSrc !== "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Kathmandu_Medical_College_Logo.png/220px-Kathmandu_Medical_College_Logo.png") {
                  setLogoSrc("https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Kathmandu_Medical_College_Logo.png/220px-Kathmandu_Medical_College_Logo.png");
                }
              }}
            />
          </div>
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-neutral-900 uppercase tracking-tight">
            {hospitalSettings.name}
          </h1>
          <p className="text-lg font-semibold text-neutral-800 uppercase tracking-wider">
            {hospitalSettings.department}
          </p>
          <p className="text-xs text-neutral-600 mt-1">
            {hospitalSettings.address} | Tel: {hospitalSettings.phone}
          </p>
        </div>
        <div className="w-32" /> {/* Spacer for balance */}
      </div>
    );
  };

  const Footer = () => (
    <div className="mt-auto pt-8 flex justify-between items-end">
      <div className="text-left">
        <div className="mb-16">
          <p className="text-xs font-bold uppercase text-neutral-400">Authorized Signature</p>
        </div>
        <p className="text-lg font-bold text-neutral-900 leading-tight">{record.doctorName || 'Asso. Prof. Dr. Anil Pokhrel'}</p>
        <p className="text-xs font-bold text-neutral-600 leading-tight mt-0.5">{record.doctorQualifications || 'MBBS, MD, DM (Nephrology)'}</p>
        <p className="text-sm font-semibold text-neutral-700 leading-tight mt-0.5">{record.doctorDesignation || 'Sr. Consultant Nephrologist'}</p>
        <p className="text-xs text-neutral-500 mt-1">NMC NO: {record.doctorNmc || '3112'}</p>
      </div>
      
      <div className="w-32 h-32 flex items-center justify-center">
        {/* Blank space for physical seal */}
      </div>
    </div>
  );

  const Body = () => (
    <div className="text-[16px] leading-relaxed text-neutral-900 space-y-6 flex-grow">
      <p>
        This is to certify that <span className="font-bold uppercase">{title} {record.patientName || '[Patient Name]'}</span>, 
        aged <span className="font-bold">{record.age || '[Age]'} years</span>, {record.gender?.toLowerCase() || '[gender]'}, 
        permanent resident of {record.municipality || '[Municipality]'}–{record.wardNo || '[Ward]'}, 
        {record.district || '[District]'}, Nepal, is a registered patient under the care of this department.
      </p>

      <p className="whitespace-pre-wrap"><span className="font-bold uppercase text-sm">Diagnosis:</span> {record.diagnosis || 'Chronic Kidney Disease Stage V, Hypertension, and Type II Diabetes Mellitus'}</p>
      
      <p>
        <span className="font-bold uppercase text-sm">Current Management:</span> The patient has been on regular maintenance hemodialysis since 
        <span className="font-bold"> {record.dialysisStartDateBS || '2080/04/15'}</span> 
        {record.dialysisStartDateAD && ` (${record.dialysisStartDateAD})`}, administered twice/thrice weekly as per prescribed medical protocol.
      </p>

      {record.transplantPlanned && (
        <p>
          <span className="font-bold uppercase text-sm">Recommendation:</span> In view of {possessive} clinical condition and advanced renal failure, the patient has been advised to undergo Renal Transplantation. Pre-transplant evaluation and medical workup are currently underway.
        </p>
      )}

      <p className="italic text-sm text-neutral-600 mt-8">
        This certificate is issued upon the patient's request for official purposes.
      </p>
    </div>
  );

  const renderTemplate = () => {
    const commonClasses = "p-12 h-[297mm] w-[210mm] mx-auto flex flex-col print:p-[15mm] print:w-full print:h-[297mm] print:mx-0 print:bg-white print:text-black bg-white relative overflow-hidden certificate-root";
    
    switch (templateId) {
      case 'modern':
      case 'standard':
      default:
        return (
          <div className={commonClasses}>
            <Header />
            
            <div className="flex justify-between mb-8 text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <span>Ref No:</span>
                <span className="text-neutral-900">{record.id?.slice(-8).toUpperCase() || '____________________'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Date:</span>
                <span className="text-neutral-900">{record.issueDateBS}</span>
              </div>
            </div>
            
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-neutral-900 uppercase tracking-tight">
                TO WHOM IT MAY CONCERN
              </h2>
              <div className="w-24 h-1 bg-neutral-900 mx-auto mt-2" />
            </div>

            <Body />
            
            <Footer />

            <div className="mt-auto pt-4 border-t border-neutral-100 flex justify-between items-center text-[10px] text-neutral-400 font-medium">
              <span>KMC Nephrology Management System</span>
              <span>ID: {record.id || '____________________'}</span>
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
              <h2 className="text-2xl font-bold underline decoration-double underline-offset-[12px] uppercase tracking-widest text-blue-900 font-serif">
                TO WHOM IT MAY CONCERN
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
