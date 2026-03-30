import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ne';

interface Translations {
  [key: string]: {
    en: string;
    ne: string;
  };
}

export const translations: Translations = {
  // Navigation
  liveEditor: { en: 'Live Editor', ne: 'लाइभ सम्पादक' },
  history: { en: 'History', ne: 'इतिहास' },
  settings: { en: 'Settings', ne: 'सेटिङहरू' },
  logout: { en: 'Logout', ne: 'लगआउट' },
  systemTitle: { en: 'KMC Nephrology', ne: 'केएमसी नेफ्रोलोजी' },
  systemSubtitle: { en: 'Certificate System', ne: 'प्रमाणपत्र प्रणाली' },
  departmentOfNephrology: { en: 'Department of Nephrology', ne: 'नेफ्रोलोजी विभाग' },

  // Form Labels
  patientDetails: { en: 'Patient Details', ne: 'बिरामीको विवरण' },
  patientName: { en: 'Patient Name', ne: 'बिरामीको नाम' },
  age: { en: 'Age', ne: 'उमेर' },
  gender: { en: 'Gender', ne: 'लिङ्ग' },
  male: { en: 'Male', ne: 'पुरुष' },
  female: { en: 'Female', ne: 'महिला' },
  other: { en: 'Other', ne: 'अन्य' },
  nagritaNumber: { en: 'Nagrita / National ID No.', ne: 'नागरिकता / राष्ट्रिय परिचयपत्र नं.' },
  phoneNumber: { en: 'Phone Number', ne: 'फोन नम्बर' },
  district: { en: 'District', ne: 'जिल्ला' },
  municipality: { en: 'Municipality', ne: 'नगरपालिका/गाउँपालिका' },
  ward: { en: 'Ward', ne: 'वडा नं.' },
  diagnosis: { en: 'Diagnosis', ne: 'निदान (Diagnosis)' },
  dialysisStart: { en: 'Dialysis/Transplant Start', ne: 'डायलासिस/प्रत्यारोपण सुरु' },
  dialysisType: { en: 'Treatment Type', ne: 'उपचारको प्रकार' },
  hemodialysis: { en: 'Hemodialysis', ne: 'हेमोडायलासिस' },
  capd: { en: 'CAPD (Peritoneal Dialysis)', ne: 'CAPD (पेरिटोनियल डायलासिस)' },
  renalTransplant: { en: 'Renal Transplant', ne: 'मृगौला प्रत्यारोपण' },
  transplantDate: { en: 'Transplant Date', ne: 'प्रत्यारोपण मिति' },
  issueDate: { en: 'Issue Date', ne: 'जारी मिति' },
  doctor: { en: 'Doctor', ne: 'डाक्टर' },
  plannedForTransplant: { en: 'Planned for Transplant', ne: 'प्रत्यारोपणको लागि योजना गरिएको' },
  optional: { en: 'Optional', ne: 'ऐच्छिक' },
  template: { en: 'Template', ne: 'टेम्प्लेट' },

  // Buttons & Actions
  generateAndSave: { en: 'Generate & Save', ne: 'उत्पादन र बचत गर्नुहोस्' },
  fillSample: { en: 'Fill Sample', ne: 'नमूना भर्नुहोस्' },
  downloadPDF: { en: 'Download PDF', ne: 'PDF डाउनलोड गर्नुहोस्' },
  printCertificate: { en: 'Print Certificate', ne: 'प्रमाणपत्र प्रिन्ट गर्नुहोस्' },
  backToHistory: { en: 'Back to History', ne: 'इतिहासमा फर्कनुहोस्' },
  backToForm: { en: 'Back to Form', ne: 'फारममा फर्कनुहोस्' },
  view: { en: 'View', ne: 'हेर्नुहोस्' },
  edit: { en: 'Edit', ne: 'सम्पादन गर्नुहोस्' },
  delete: { en: 'Delete', ne: 'हटाउनुहोस्' },
  save: { en: 'Save', ne: 'बचत गर्नुहोस्' },
  add: { en: 'Add', ne: 'थप्नुहोस्' },

  // Certificate Content
  toWhomItMayConcern: { en: 'TO WHOM IT MAY CONCERN', ne: 'जसलाई सरोकार छ' },
  certificateTitle: { en: 'Medical Certificate', ne: 'चिकित्सा प्रमाणपत्र' },
  certifyThat: { en: 'This is to certify that', ne: 'यो प्रमाणित गरिन्छ कि' },
  aged: { en: 'aged', ne: 'उमेर' },
  years: { en: 'years', ne: 'वर्ष' },
  residentOf: { en: 'permanent resident of', ne: 'स्थायी बासिन्दा' },
  registeredPatient: { en: 'is a registered patient under the care of this department.', ne: 'यस विभागको रेखदेखमा दर्ता भएका बिरामी हुन्।' },
  currentManagement: { en: 'Current Management', ne: 'हालको व्यवस्थापन' },
  recommendation: { en: 'Recommendation', ne: 'सिफारिस' },
  authorizedSignature: { en: 'Authorized Signature', ne: 'अधिकृत हस्ताक्षर' },
  refNo: { en: 'Ref No', ne: 'सन्दर्भ नं.' },
  date: { en: 'Date', ne: 'मिति' },
  nmcNo: { en: 'NMC NO', ne: 'NMC नं.' },

  // Settings
  hospitalSettings: { en: 'Hospital Settings', ne: 'अस्पताल सेटिङहरू' },
  diagnosisManagement: { en: 'Diagnosis Management', ne: 'निदान व्यवस्थापन' },
  doctorManagement: { en: 'Doctor Management', ne: 'डाक्टर व्यवस्थापन' },
  hospitalName: { en: 'Hospital Name', ne: 'अस्पतालको नाम' },
  hospitalNameNe: { en: 'Hospital Name (Nepali)', ne: 'अस्पतालको नाम (नेपाली)' },
  department: { en: 'Department', ne: 'विभाग' },
  address: { en: 'Address', ne: 'ठेगाना' },
  hospitalPhone: { en: 'Phone Number', ne: 'फोन नम्बर' },
  hospitalLogo: { en: 'Hospital Logo', ne: 'अस्पतालको लोगो' },
  uploadNewLogo: { en: 'Upload New Logo', ne: 'नयाँ लोगो अपलोड गर्नुहोस्' },

  // Table
  patient: { en: 'Patient', ne: 'बिरामी' },
  actions: { en: 'Actions', ne: 'कार्यहरू' },
  certificateHistory: { en: 'Certificate History', ne: 'प्रमाणपत्र इतिहास' },
  viewHistoryDesc: { en: 'View and re-print past certificates', ne: 'विगतका प्रमाणपत्रहरू हेर्नुहोस् र पुन: प्रिन्ट गर्नुहोस्' },
  searchPlaceholder: { en: 'Search by patient name or district...', ne: 'बिरामीको नाम वा जिल्लाबाट खोज्नुहोस्...' },
  noRecords: { en: 'No records found.', ne: 'कुनै रेकर्ड फेला परेन।' },
  loadingRecords: { en: 'Loading records...', ne: 'रेकर्डहरू लोड हुँदैछ...' },

  // Certificate Content
  medicalCertificate: { en: 'MEDICAL CERTIFICATE', ne: 'चिकित्सा प्रमाणपत्र' },
  certifyPrefix: { en: 'This is to certify that', ne: 'यो प्रमाणित गरिन्छ कि' },
  ageGenderPrefix: { en: 'aged', ne: 'उमेर' },
  nagritaPrefix: { en: 'bearing Nagrita No.', ne: 'नागरिकता नं.' },
  underTreatment: { en: 'is a registered patient under the care of this department.', ne: 'यस विभागको रेखदेखमा दर्ता भएका बिरामी हुन्।' },
  dialysisStartPrefix: { en: 'The patient has been undergoing regular', ne: 'बिरामीले' },
  dialysisStartSuffix: { en: 'since', ne: 'देखि यस केन्द्रमा नियमित' },
  atThisCenter: { en: 'at this center.', ne: 'गराइरहेका छन्।' },
  transplantPrefix: { en: 'The patient underwent successful Renal Transplantation on', ne: 'बिरामीको' },
  transplantSuffix: { en: 'at this center.', ne: 'गते यस केन्द्रमा सफल मृगौला प्रत्यारोपण गरिएको थियो।' },
  footerNote: { en: 'This certificate is issued upon the patient\'s request for official purposes.', ne: 'यो प्रमाणपत्र बिरामीको अनुरोधमा आधिकारिक उद्देश्यका लागि जारी गरिएको हो।' },
  authorizedBy: { en: 'Authorized Signature', ne: 'अधिकृत हस्ताक्षर' },
  nepal: { en: 'Nepal', ne: 'नेपाल' },
  preview: { en: 'Preview', ne: 'पूर्वावलोकन' },
  print: { en: 'Print', ne: 'प्रिन्ट' },
  noData: { en: 'No data to preview', ne: 'पूर्वावलोकन गर्न कुनै डाटा छैन' },

  // Settings
  hospitalSettingsDesc: { en: 'Update hospital name, logo, and contact details', ne: 'अस्पतालको नाम, लोगो र सम्पर्क विवरणहरू अपडेट गर्नुहोस्' },
  diagnosisManagementDesc: { en: 'Manage common diagnoses for quick selection', ne: 'द्रुत चयनको लागि सामान्य निदानहरू व्यवस्थापन गर्नुहोस्' },
  doctorManagementDesc: { en: 'Manage doctors who can sign certificates', ne: 'प्रमाणपत्रमा हस्ताक्षर गर्न सक्ने डाक्टरहरू व्यवस्थापन गर्नुहोस्' },
  enterNewDiagnosis: { en: 'Enter a new common diagnosis...', ne: 'नयाँ सामान्य निदान प्रविष्ट गर्नुहोस्...' },
  noDiagnoses: { en: 'No common diagnoses added yet.', ne: 'अहिलेसम्म कुनै सामान्य निदान थपिएको छैन।' },
  editDoctorDetails: { en: 'Edit Doctor Details', ne: 'डाक्टरको विवरण सम्पादन गर्नुहोस्' },
  newDoctorDetails: { en: 'New Doctor Details', ne: 'नयाँ डाक्टरको विवरण' },
  fullName: { en: 'Full Name', ne: 'पूरा नाम' },
  qualifications: { en: 'Qualifications', ne: 'योग्यता' },
  nmcNumber: { en: 'NMC Number', ne: 'NMC नम्बर' },
  designation: { en: 'Designation', ne: 'पद' },
  cancel: { en: 'Cancel', ne: 'रद्द गर्नुहोस्' },
  updateDoctor: { en: 'Update Doctor', ne: 'डाक्टर अपडेट गर्नुहोस्' },
  saveDoctor: { en: 'Save Doctor', ne: 'डाक्टर बचत गर्नुहोस्' },
  noDoctors: { en: 'No doctors added yet.', ne: 'अहिलेसम्म कुनै डाक्टर थपिएको छैन।' },
  addFirstDoctor: { en: 'Add your first doctor', ne: 'तपाईंको पहिलो डाक्टर थप्नुहोस्' },
  saveHospitalSettings: { en: 'Save Hospital Settings', ne: 'अस्पताल सेटिङहरू बचत गर्नुहोस्' },
  hospitalSettingsSaved: { en: 'Hospital settings saved successfully!', ne: 'अस्पताल सेटिङहरू सफलतापूर्वक बचत गरियो!' },
  confirmDeleteDiagnosis: { en: 'Are you sure you want to delete this diagnosis?', ne: 'के तपाईं पक्का यो निदान हटाउन चाहनुहुन्छ?' },
  confirmDeleteDoctor: { en: 'Are you sure you want to delete this doctor?', ne: 'के तपाईं पक्का यो डाक्टर हटाउन चाहनुहुन्छ?' },
  imageSizeTooLarge: { en: 'Image size too large. Please use a smaller image (under 500KB).', ne: 'छवि साइज धेरै ठूलो छ। कृपया सानो छवि (५००KB भन्दा कम) प्रयोग गर्नुहोस्।' },
  invalidDateFormat: { en: 'Invalid date format (YYYY/MM/DD)', ne: 'गलत मिति ढाँचा (YYYY/MM/DD)' },
  invalidNepaliDate: { en: 'Invalid Nepali date', ne: 'गलत नेपाली मिति' },
  dateInFuture: { en: 'Date cannot be in the future', ne: 'मिति भविष्यको हुन सक्दैन' },
  minDateError: { en: 'Date is too far in the past', ne: 'मिति धेरै पुरानो भयो' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatNumber: (num: string | number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const nepaliNumerals: { [key: string]: string } = {
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
  };

  const formatNumber = (num: string | number): string => {
    const str = num.toString();
    if (language === 'en') return str;
    return str.split('').map(char => nepaliNumerals[char] || char).join('');
  };

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatNumber }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
