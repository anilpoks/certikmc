import { collection, onSnapshot, query } from 'firebase/firestore';
import { Download, Printer, FileText, FileCheck } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { HospitalSettings, PatientRecord } from '../types';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { getLocalizedDistrictName, getLocalizedMunicipalityName } from '../utils/nepal-utils';
import { DISTRICTS } from '../data/nepal-data';
import { useLanguage } from '../contexts/LanguageContext';
import GovernmentForm from './GovernmentForm';

interface CertificatePreviewProps {
  record: Partial<PatientRecord>;
}

export default function CertificatePreview({ record }: CertificatePreviewProps) {
  const { t, language, formatNumber } = useLanguage();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<'certificate' | 'govForm'>('certificate');
  const [hospitalSettings, setHospitalSettings] = useState<HospitalSettings>({
    name: 'Kathmandu Medical College Public Limited',
    nameNe: 'काठमाडौं मेडिकल कलेज पब्लिक लिमिटेड',
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
        setHospitalSettings(prev => ({ ...prev, ...settings }));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'hospitalSettings');
    });
    return () => unsubscribe();
  }, []);

  const handlePrint = () => {
    setShowPrintConfirm(true);
  };

  const confirmPrint = async () => {
    setShowPrintConfirm(false);
    if (!certificateRef.current) return;
    
    // Pre-load images before printing
    const images = certificateRef.current.querySelectorAll('img');
    await Promise.all(Array.from(images).map(imgNode => {
      const img = imgNode as HTMLImageElement;
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));

    // Wait for fonts to be ready
    if (document.fonts) {
      await document.fonts.ready;
    }

    // Small delay to ensure layout is stable
    await new Promise(resolve => setTimeout(resolve, 500));

    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    
    setIsExporting(true);
    const element = certificateRef.current;

    // Pre-load images before PDF generation
    const images = element.querySelectorAll('img');
    await Promise.all(Array.from(images).map(imgNode => {
      const img = imgNode as HTMLImageElement;
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));
    
    // Standard A4 dimensions at 96 DPI for html2canvas
    const a4WidthPx = 794;
    const a4HeightPx = 1123;

    const opt = {
      margin: 0,
      filename: `${viewMode === 'certificate' ? 'KMC_Certificate' : 'Govt_Form'}_${record.patientName?.replace(/\s+/g, '_') || 'Patient'}.pdf`,
      image: { type: 'png' as const, quality: 1.0 },
      html2canvas: { 
        scale: 3, // Slightly lower scale for multi-page stability
        useCORS: true,
        allowTaint: false,
        letterRendering: true,
        logging: false,
        width: a4WidthPx,
        windowWidth: a4WidthPx,
        scrollY: 0,
        scrollX: 0,
        backgroundColor: '#ffffff',
        imageTimeout: 0,
        dpi: 300,
        onclone: (clonedDoc: Document) => {
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&family=Noto+Serif+Devanagari:wght@400;500;600;700;800;900&display=swap');
            * {
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
            }
            .certificate-root {
              font-family: 'Inter', 'Noto Sans Devanagari', sans-serif !important;
            }
            .font-serif {
              font-family: 'Noto Serif Devanagari', serif !important;
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
        precision: 16
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      if (document.fonts) {
        await document.fonts.ready;
      }

      // For multi-page, we don't force a fixed height on the container
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = `${a4WidthPx}px`;
      container.style.backgroundColor = 'white';
      container.style.zIndex = '-1';
      
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.width = `${a4WidthPx}px`;
      clone.style.margin = '0';
      clone.style.padding = '0';
      clone.style.border = 'none';
      clone.style.boxShadow = 'none';
      clone.style.transform = 'none';
      
      container.appendChild(clone);
      document.body.appendChild(container);

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
    if (gender === 'Male') return { subject: 'He', title: language === 'en' ? 'Mr.' : 'श्री', possessive: language === 'en' ? 'his' : 'उनको' };
    if (gender === 'Female') return { subject: 'She', title: language === 'en' ? 'Ms.' : 'सुश्री', possessive: language === 'en' ? 'her' : 'उनको' };
    return { subject: 'They', title: language === 'en' ? 'Mx.' : 'श्री/सुश्री', possessive: language === 'en' ? 'their' : 'उनको' };
  };

  const { title, possessive } = getPronoun(record.gender);
  const templateId = record.templateId || 'standard';

  const Header = () => {
    const logoSrc = hospitalSettings.logoUrl || "https://kmc.edu.np/wp-content/uploads/2023/06/kmc-logo.png";

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
            />
          </div>
        </div>
        <div className="flex-1 text-center px-4">
          <h1 className="text-2xl font-extrabold text-neutral-900 uppercase tracking-tight leading-tight">
            {language === 'ne' ? (hospitalSettings.nameNe || hospitalSettings.name) : hospitalSettings.name}
          </h1>
          <p className="text-lg font-bold text-neutral-800 uppercase tracking-widest mt-1">
            {hospitalSettings.department}
          </p>
          <div className="flex flex-col items-center mt-2">
            <div className="h-0.5 w-16 bg-neutral-900 mb-2" />
            <p className="text-xs font-medium text-neutral-600">
              {hospitalSettings.address}
            </p>
            <p className="text-xs font-bold text-neutral-700 mt-0.5">
              Tel: {hospitalSettings.phone}
            </p>
          </div>
        </div>
        <div className="w-32" /> {/* Spacer for balance */}
      </div>
    );
  };

  const Footer = () => (
    <div className="mt-auto pt-8 flex justify-between items-end">
      <div className="text-left">
        <div className="mb-16">
          <p className="text-xs font-bold uppercase text-neutral-400">{t('authorizedBy')}</p>
        </div>
        <p className="text-lg font-bold text-neutral-900 leading-tight">{record.doctorName || 'Asso. Prof. Dr. Anil Pokhrel'}</p>
        <p className="text-xs font-bold text-neutral-600 leading-tight mt-0.5">{record.doctorQualifications || 'MBBS, MD, DM (Nephrology)'}</p>
        <p className="text-sm font-semibold text-neutral-700 leading-tight mt-0.5">{record.doctorDesignation || 'Sr. Consultant Nephrologist'}</p>
        <p className="text-xs font-bold text-black mt-1">NMC NO: {record.doctorNmc ? formatNumber(record.doctorNmc) : '3112'}</p>
      </div>
      
      <div className="w-32 h-32 flex items-center justify-center">
        {/* Blank space for physical seal */}
      </div>
    </div>
  );

  const Body = () => (
    <div className="text-[16px] leading-relaxed text-neutral-900 space-y-6 flex-grow">
      <p>
        {t('certifyPrefix')} <span className="font-bold uppercase">{title} {record.patientName || '[Patient Name]'}</span>, 
        {t('ageGenderPrefix')} <span className="font-bold">{record.age ? formatNumber(record.age) : '[Age]'} {t('years')}</span>, {language === 'en' ? record.gender?.toLowerCase() : (record.gender === 'Male' ? 'पुरुष' : record.gender === 'Female' ? 'महिला' : 'अन्य')}, 
        {record.nagritaNumber && (
          <>
            ({t('nagritaPrefix')} <span className="font-bold">{formatNumber(record.nagritaNumber)}</span>), 
          </>
        )}
        {record.patientPhone && (
          <>
            ({t('phoneNumber')}: <span className="font-bold">{formatNumber(record.patientPhone)}</span>), 
          </>
        )}
        {t('residentOf')} {getLocalizedMunicipalityName(record.district || '', record.municipality || '', language)}–{record.wardNo ? formatNumber(record.wardNo) : '[Ward]'}, 
        {getLocalizedDistrictName(record.district || '', language)}, {t('nepal')}, {t('underTreatment')}
      </p>

      <p className="whitespace-pre-wrap"><span className="font-bold uppercase text-sm">{t('diagnosis')}:</span> {record.diagnosis || 'Chronic Kidney Disease Stage V, Hypertension, and Type II Diabetes Mellitus'}</p>
      
      <p>
        <span className="font-bold uppercase text-sm">{t('currentManagement')}:</span> 
        {record.dialysisType === 'Transplant' ? (
          <>
            {t('transplantPrefix')} 
            <span className="font-bold"> {record.dialysisStartDateBS ? formatNumber(record.dialysisStartDateBS) : '२०८०/०४/१५'}</span> 
            {record.dialysisStartDateAD && ` (${formatNumber(record.dialysisStartDateAD)})`} {t('transplantSuffix')}
          </>
        ) : (
          <>
            {t('dialysisStartPrefix')} 
            <span className="font-bold"> {record.dialysisType === 'CAPD' ? t('capd') : t('hemodialysis')}</span> {t('dialysisStartSuffix')}
            <span className="font-bold"> {record.dialysisStartDateBS ? formatNumber(record.dialysisStartDateBS) : '२०८०/०४/१५'}</span> 
            {record.dialysisStartDateAD && ` (${formatNumber(record.dialysisStartDateAD)})`} {t('atThisCenter')}
          </>
        )}
      </p>

      {record.transplantPlanned && record.dialysisType !== 'Transplant' && (
        <p>
          <span className="font-bold uppercase text-sm">{t('recommendation')}:</span> {language === 'en' ? `In view of ${possessive} clinical condition and advanced renal failure, the patient has been advised to undergo Renal Transplantation. Pre-transplant evaluation and medical workup are currently underway.` : `उनको क्लिनिकल अवस्था र उन्नत मृगौला विफलतालाई ध्यानमा राख्दै, बिरामीलाई मृगौला प्रत्यारोपण गर्न सल्लाह दिइएको छ। प्रत्यारोपण पूर्व मूल्याङ्कन र चिकित्सा कार्य हाल भइरहेको छ।`}
        </p>
      )}

      <p className="italic text-sm text-neutral-600 mt-8">
        {t('footerNote')}
      </p>
    </div>
  );

  const renderTemplate = () => {
    const commonClasses = "p-12 h-[297mm] w-[210mm] mx-auto flex flex-col print:p-[15mm] print:w-full print:h-[297mm] print:mx-0 print:bg-white print:text-black bg-white relative overflow-hidden certificate-root";
    
    switch (templateId) {
      case 'modern':
        return (
          <div className={`${commonClasses} !p-16`}>
            {/* Minimalist Header */}
            <div className="flex flex-col items-center mb-12">
              <div className="h-20 w-20 mb-4">
                <img 
                  src={hospitalSettings.logoUrl || "https://kmc.edu.np/wp-content/uploads/2023/06/kmc-logo.png"} 
                  alt="Hospital Logo" 
                  className="h-full w-full object-contain grayscale opacity-80"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              </div>
              <h1 className="text-xl font-light text-neutral-900 uppercase tracking-[0.2em] text-center">
                {language === 'ne' ? (hospitalSettings.nameNe || hospitalSettings.name) : hospitalSettings.name}
              </h1>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-2">
                {hospitalSettings.department} • {hospitalSettings.address}
              </p>
            </div>
            
            <div className="flex justify-between mb-16 text-[9px] uppercase tracking-[0.3em] text-neutral-300">
              <div className="flex items-center gap-2">
                <span>{t('refNo')}:</span>
                <span className="text-neutral-500">{record.id?.slice(-8).toUpperCase() || '____________________'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{t('date')}:</span>
                <span className="text-neutral-500">{record.issueDateBS ? formatNumber(record.issueDateBS) : ''}</span>
              </div>
            </div>
            
            <div className="text-center mb-16">
              <h2 className="text-3xl font-thin text-neutral-900 uppercase tracking-[0.4em]">
                {t('medicalCertificate')}
              </h2>
            </div>

            <div className="text-[15px] leading-[1.8] text-neutral-600 space-y-8 flex-grow font-light">
              <Body />
            </div>
            
            <div className="mt-auto pt-12 flex justify-between items-end border-t border-neutral-50">
              <div className="text-left">
                <p className="text-lg font-medium text-neutral-900">{record.doctorName}</p>
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">{record.doctorDesignation}</p>
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest">NMC: {record.doctorNmc}</p>
              </div>
              <div className="text-right text-[9px] text-neutral-300 uppercase tracking-widest">
                KMC Nephrology • {record.id?.slice(-8)}
              </div>
            </div>
          </div>
        );
      case 'classic':
        return (
          <div className={`${commonClasses} border-[24px] border-double border-neutral-100`}>
            {/* Classic Border Overlay */}
            <div className="absolute inset-4 border border-neutral-200 pointer-events-none" />
            
            <Header />
            
            <div className="flex justify-between mb-10 text-xs font-serif italic text-neutral-500">
              <div>{t('refNo')}: <span className="text-neutral-900 font-bold">{record.id?.slice(-8).toUpperCase() || '_________'}</span></div>
              <div>{t('date')}: <span className="text-neutral-900 font-bold">{record.issueDateBS}</span></div>
            </div>

            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-neutral-900 uppercase tracking-[0.1em] font-serif border-y-2 border-neutral-900 py-4 inline-block px-12">
                {t('medicalCertificate')}
              </h2>
            </div>

            <div className="font-serif text-lg leading-relaxed text-neutral-800 space-y-6 flex-grow">
              <Body />
            </div>
            
            <div className="mt-auto pt-12 flex justify-between items-end">
              <div className="text-left font-serif">
                <div className="w-48 border-b border-neutral-900 mb-2" />
                <p className="text-xl font-bold text-neutral-900">{record.doctorName}</p>
                <p className="text-sm italic text-neutral-600">{record.doctorDesignation}</p>
                <p className="text-sm font-bold">NMC: {record.doctorNmc}</p>
              </div>
              <div className="w-32 h-32 border-2 border-dashed border-neutral-100 rounded-full flex items-center justify-center text-[8px] text-neutral-300 uppercase text-center p-4">
                Hospital Seal
              </div>
            </div>
          </div>
        );
      case 'standard':
      default:
        return (
          <div className={commonClasses}>
            <Header />
            
            <div className="flex justify-between mb-8 text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <span>{t('refNo')}:</span>
                <span className="text-neutral-900">{record.id?.slice(-8).toUpperCase() || '____________________'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{t('date')}:</span>
                <span className="text-neutral-900">{record.issueDateBS ? formatNumber(record.issueDateBS) : ''}</span>
              </div>
            </div>
            
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-neutral-900 uppercase tracking-tight">
                {t('medicalCertificate')}
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
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-4xl mx-auto print:shadow-none print:p-0 print:m-0 print:max-w-none print:bg-white">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 print:hidden gap-4">
        <div className="flex bg-neutral-100 p-1 rounded-2xl">
          <button
            onClick={() => setViewMode('certificate')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
              viewMode === 'certificate' 
                ? 'bg-white text-neutral-900 shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            {t('medicalCertificate')}
          </button>
          <button
            onClick={() => setViewMode('govForm')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
              viewMode === 'govForm' 
                ? 'bg-white text-neutral-900 shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            Govt Form (2-Page)
          </button>
        </div>

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
              {t('downloadPDF')}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-neutral-800 transition-all"
            >
              <Printer className="w-5 h-5" />
              {t('print')}
            </button>
          </div>
          <p className="text-[10px] text-neutral-400 max-w-[300px] leading-tight">
            Note: If the print dialog doesn't appear, please open the app in a new tab. 
            PDF export works best for digital sharing.
          </p>
        </div>
      </div>
      
      <div ref={certificateRef} id="print-area">
        {viewMode === 'certificate' ? (
          renderTemplate()
        ) : (
          <GovernmentForm record={record} hospitalSettings={hospitalSettings} />
        )}
      </div>

      {/* Print Confirmation Modal */}
      {showPrintConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in fade-in zoom-in duration-200">
            <div className="bg-neutral-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Printer className="w-8 h-8 text-neutral-900" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 text-center mb-2">
              {language === 'en' ? 'Confirm Print' : 'प्रिन्ट पुष्टि गर्नुहोस्'}
            </h3>
            <p className="text-neutral-500 text-center mb-8">
              {language === 'en' 
                ? `Are you sure you want to print the ${viewMode === 'certificate' ? 'medical certificate' : 'government form'}?` 
                : `के तपाईं ${viewMode === 'certificate' ? 'चिकित्सा प्रमाणपत्र' : 'सरकारी फारम'} प्रिन्ट गर्न चाहनुहुन्छ?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPrintConfirm(false)}
                className="flex-1 px-6 py-3 rounded-2xl font-bold text-neutral-500 hover:bg-neutral-100 transition-all"
              >
                {language === 'en' ? 'Cancel' : 'रद्द गर्नुहोस्'}
              </button>
              <button
                onClick={confirmPrint}
                className="flex-1 bg-neutral-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-neutral-800 shadow-lg shadow-neutral-900/20 transition-all"
              >
                {language === 'en' ? 'Print Now' : 'अहिले प्रिन्ट गर्नुहोस्'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
