import { addDoc, collection, onSnapshot, query, serverTimestamp } from 'firebase/firestore';
import { Calendar as CalendarIcon, CheckCircle, FileText, Layout, Save, User } from 'lucide-react';
import NepaliDate from 'nepali-date-converter';
import React, { useEffect, useState } from 'react';
import { NepaliDatePicker } from 'nepali-datepicker-reactjs';
import 'nepali-datepicker-reactjs/dist/index.css';
import { COMMON_DIAGNOSES, DISTRICTS } from '../data/nepal-data';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { Doctor, PatientRecord } from '../types';
import SearchableSelect from './SearchableSelect';
import { useLanguage } from '../contexts/LanguageContext';

interface CertificateFormProps {
  onSuccess: (record: PatientRecord) => void;
  onChange?: (data: Partial<PatientRecord>) => void;
}

export default function CertificateForm({ onSuccess, onChange }: CertificateFormProps) {
  const { t, language } = useLanguage();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [commonDiagnoses, setCommonDiagnoses] = useState<string[]>(COMMON_DIAGNOSES);
  const [formData, setFormData] = useState<Partial<PatientRecord>>({
    templateId: 'standard',
    patientName: '',
    age: 0,
    gender: 'Male',
    nagritaNumber: '',
    patientPhone: '',
    district: DISTRICTS[0].name,
    municipality: DISTRICTS[0].municipalities[0].name,
    wardNo: '',
    tole: '',
    dialysisType: 'Hemodialysis',
    diagnosis: COMMON_DIAGNOSES[0],
    issueDateBS: new NepaliDate().format('YYYY/MM/DD'),
    issueDateAD: new NepaliDate().toJsDate().toISOString().split('T')[0],
    transplantPlanned: false,
    doctorId: '',
    doctorName: '',
    doctorNmc: '',
    doctorDesignation: '',
    doctorQualifications: '',
    doctorDepartment: '',
    doctorHospital: 'Kathmandu Medical College Public Limited',
  });

  const templates = [
    { id: 'standard', name: 'Standard', nameNe: 'साधारण' },
    { id: 'classic', name: 'Classic (Formal)', nameNe: 'क्लासिक (औपचारिक)' },
    { id: 'modern', name: 'Modern (Minimal)', nameNe: 'आधुनिक (न्यूनतम)' },
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.patientName || formData.patientName.trim().length < 3) {
      newErrors.patientName = language === 'en' ? 'Patient name must be at least 3 characters' : 'बिरामीको नाम कम्तिमा ३ अक्षरको हुनुपर्छ';
    }
    
    if (!formData.district) {
      newErrors.district = language === 'en' ? 'District is required' : 'जिल्ला आवश्यक छ';
    }

    if (!formData.age || formData.age <= 0) {
      newErrors.age = language === 'en' ? 'Valid age is required' : 'सही उमेर आवश्यक छ';
    }

    if (!formData.wardNo) {
      newErrors.wardNo = language === 'en' ? 'Ward number is required' : 'वडा नम्बर आवश्यक छ';
    }

    if (!formData.diagnosis || formData.diagnosis.trim().length === 0) {
      newErrors.diagnosis = language === 'en' ? 'Diagnosis is required' : 'निदान आवश्यक छ';
    }

    if (!formData.doctorId) {
      newErrors.doctorId = language === 'en' ? 'Please select a doctor' : 'कृपया डाक्टर छान्नुहोस्';
    }

    // Date validation
    const dateRegex = /^\d{4}[\/\-]\d{2}[\/\-]\d{2}$/;
    const today = new NepaliDate();
    
    if (!formData.issueDateBS || !dateRegex.test(formData.issueDateBS)) {
      newErrors.issueDateBS = t('invalidDateFormat');
    } else {
      try {
        const date = new NepaliDate(formData.issueDateBS);
        if (date.getYear() < 2000 || date.getYear() > 2100) {
          newErrors.issueDateBS = t('invalidNepaliDate');
        }
      } catch (e) {
        newErrors.issueDateBS = t('invalidNepaliDate');
      }
    }

    if (formData.dialysisStartDateBS) {
      if (!dateRegex.test(formData.dialysisStartDateBS)) {
        newErrors.dialysisStartDateBS = t('invalidDateFormat');
      } else {
        try {
          const date = new NepaliDate(formData.dialysisStartDateBS);
          if (date.getYear() < 2000 || date.getYear() > 2100) {
            newErrors.dialysisStartDateBS = t('invalidNepaliDate');
          } else if (date.toJsDate() > today.toJsDate()) {
            newErrors.dialysisStartDateBS = t('dateInFuture');
          }
        } catch (e) {
          newErrors.dialysisStartDateBS = t('invalidNepaliDate');
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    validate();
    if (onChange) {
      onChange(formData);
    }
  }, [formData]);

  useEffect(() => {
    const q = query(collection(db, 'commonDiagnoses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const diagnosesList = snapshot.docs.map(doc => doc.data().name as string);
        setCommonDiagnoses(diagnosesList);
        
        // If current diagnosis is default and we have custom ones, maybe update it?
        // Actually, better to just let the user pick.
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'commonDiagnoses');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'doctors'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const doctorsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Doctor[];
      setDoctors(doctorsList);
      
      // Set initial doctor if available and not already set
      if (doctorsList.length > 0 && !formData.doctorId) {
        const doctor = doctorsList[0];
        setFormData(prev => ({
          ...prev,
          doctorId: doctor.id || '',
          doctorName: doctor.name,
          doctorNmc: doctor.nmcNumber,
          doctorDesignation: doctor.designation,
          doctorQualifications: doctor.qualifications,
          doctorDepartment: doctor.department,
          doctorHospital: 'Kathmandu Medical College Public Limited',
        }));
      } else if (doctorsList.length === 0 && !formData.doctorId) {
        // Fallback to default doctor if none in database
        setFormData(prev => ({
          ...prev,
          doctorName: 'Asso. Prof. Dr. Anil Pokhrel',
          doctorDesignation: 'Sr. Consultant Nephrologist',
          doctorQualifications: 'MBBS, MD, DM (Nephrology)',
          doctorNmc: '3112',
          doctorDepartment: 'Department of Nephrology',
          doctorHospital: 'Kathmandu Medical College Public Limited',
        }));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'doctors');
    });
    return () => unsubscribe();
  }, []);

  const handleBSDateChange = (field: 'issueDateBS' | 'dialysisStartDateBS', value: string) => {
    if (!value) {
      const adField = field === 'issueDateBS' ? 'issueDateAD' : 'dialysisStartDateAD';
      setFormData(prev => ({ ...prev, [field]: '', [adField]: '' }));
      return;
    }
    try {
      const nepaliDate = new NepaliDate(value);
      const adDate = nepaliDate.toJsDate().toISOString().split('T')[0];
      const adField = field === 'issueDateBS' ? 'issueDateAD' : 'dialysisStartDateAD';
      setFormData(prev => ({ ...prev, [field]: value, [adField]: adDate }));
    } catch (e) {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleADDateChange = (field: 'issueDateAD' | 'dialysisStartDateAD', value: string) => {
    if (!value) {
      const bsField = field === 'issueDateAD' ? 'issueDateBS' : 'dialysisStartDateBS';
      setFormData(prev => ({ ...prev, [field]: '', [bsField]: '' }));
      return;
    }
    try {
      const adDate = new Date(value);
      if (isNaN(adDate.getTime())) {
        setFormData(prev => ({ ...prev, [field]: value }));
        return;
      }
      const nepaliDate = new NepaliDate(adDate);
      const bsDate = nepaliDate.format('YYYY/MM/DD');
      const bsField = field === 'issueDateAD' ? 'issueDateBS' : 'dialysisStartDateBS';
      setFormData(prev => ({ ...prev, [field]: value, [bsField]: bsDate }));
    } catch (e) {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      setFormData(prev => ({
        ...prev,
        doctorId: doctor.id || '',
        doctorName: doctor.name,
        doctorNmc: doctor.nmcNumber,
        doctorDesignation: doctor.designation,
        doctorQualifications: doctor.qualifications,
        doctorDepartment: doctor.department,
        doctorHospital: 'Kathmandu Medical College Public Limited',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !validate()) return;

    setIsSubmitting(true);
    try {
      const record: PatientRecord = {
        ...formData as PatientRecord,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid,
      };
      const docRef = await addDoc(collection(db, 'records'), record);
      onSuccess({ ...record, id: docRef.id });
    } catch (error) {
      console.error('Error saving record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillSampleData = () => {
    const todayBS = new NepaliDate().format('YYYY/MM/DD');
    const todayAD = new NepaliDate().toJsDate().toISOString().split('T')[0];
    
    setFormData(prev => ({
      ...prev,
      patientName: 'Rishikesh Prasad Regmi',
      age: 58,
      gender: 'Male',
      nagritaNumber: '12-34-56-78901',
      patientPhone: '+977-9841234567',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metropolitan City',
      wardNo: '16',
      tole: 'Shantinagar',
      dialysisType: 'Hemodialysis',
      diagnosis: 'Chronic Kidney Disease (CKD) Stage V, Hypertension (HTN), Diabetes Mellitus Type II (DM-II)',
      dialysisStartDateBS: '2080/04/15',
      dialysisStartDateAD: '2023/07/31',
      issueDateBS: todayBS,
      issueDateAD: todayAD,
      transplantPlanned: true,
      doctorName: 'Asso. Prof. Dr. Anil Pokhrel',
      doctorDesignation: 'Sr. Consultant Nephrologist',
      doctorQualifications: 'MBBS, MD, DM (Nephrology)',
      doctorNmc: '3112',
      doctorDepartment: 'Department of Nephrology',
      doctorHospital: 'Kathmandu Medical College Public Limited',
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-3xl">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-neutral-100 p-2 rounded-xl">
            <User className="w-5 h-5 text-neutral-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">{t('patientDetails')}</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={fillSampleData}
          className="text-[10px] font-bold text-neutral-500 hover:text-neutral-900 transition-colors bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100 uppercase tracking-wider"
        >
          {t('fillSample')}
        </button>
      </div>

      {/* Template Selection */}
      <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Layout className="w-4 h-4 text-neutral-400" />
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            {language === 'en' ? 'Certificate Style' : 'प्रमाणपत्र शैली'}
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, templateId: template.id as any }));
                if (onChange) onChange({ templateId: template.id as any });
              }}
              className={`relative px-4 py-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-1 group ${
                formData.templateId === template.id
                  ? 'border-neutral-900 bg-white shadow-md'
                  : 'border-transparent bg-white/50 text-neutral-500 hover:bg-white hover:border-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${formData.templateId === template.id ? 'text-neutral-900' : ''}`}>
                  {language === 'en' ? template.name : template.nameNe}
                </span>
                {formData.templateId === template.id && (
                  <div className="bg-neutral-900 rounded-full p-0.5">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <span className="text-[10px] uppercase tracking-widest opacity-50 font-medium">
                {template.id === 'standard' ? 'Official' : template.id === 'modern' ? 'Minimalist' : 'Formal Border'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('patientName')}</label>
          <input
            required
            type="text"
            value={formData.patientName}
            onChange={e => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
            className={`w-full px-3 py-2.5 text-sm rounded-xl border ${errors.patientName ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-200'} focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all`}
            placeholder="e.g. Rishikesh Prasad Regmi"
          />
          {errors.patientName && <p className="text-[10px] text-red-500 font-medium">{errors.patientName}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('nagritaNumber')} ({t('optional')})</label>
          <input
            type="text"
            value={formData.nagritaNumber}
            onChange={e => setFormData(prev => ({ ...prev, nagritaNumber: e.target.value }))}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all"
            placeholder="e.g. 12-34-56-78901"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('phoneNumber')} ({t('optional')})</label>
          <input
            type="text"
            value={formData.patientPhone}
            onChange={e => setFormData(prev => ({ ...prev, patientPhone: e.target.value }))}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all"
            placeholder="e.g. +977-98XXXXXXXX"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('age')}</label>
            <input
              required
              type="number"
              value={formData.age}
              onChange={e => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
              className={`w-full px-3 py-2.5 text-sm rounded-xl border ${errors.age ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-200'} focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all`}
            />
            {errors.age && <p className="text-[10px] text-red-500 font-medium">{errors.age}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('gender')}</label>
            <select
              value={formData.gender}
              onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all"
            >
              <option value="Male">{t('male')}</option>
              <option value="Female">{t('female')}</option>
              <option value="Other">{t('other')}</option>
            </select>
          </div>
        </div>

        <SearchableSelect
          label={t('district')}
          options={DISTRICTS}
          value={formData.district || ''}
          onChange={(value) => {
            const district = DISTRICTS.find(d => d.name === value);
            setFormData(prev => ({
              ...prev,
              district: value,
              municipality: district?.municipalities[0].name || ''
            }));
          }}
          placeholder={language === 'en' ? "Select District" : "जिल्ला छान्नुहोस्"}
          error={errors.district}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SearchableSelect
            label={t('municipality')}
            options={DISTRICTS.find(d => d.name === formData.district)?.municipalities || []}
            value={formData.municipality || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, municipality: value }))}
            placeholder={language === 'en' ? "Select Municipality" : "नगरपालिका छान्नुहोस्"}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('ward')}</label>
            <input
              required
              type="text"
              value={formData.wardNo}
              onChange={e => setFormData(prev => ({ ...prev, wardNo: e.target.value }))}
              className={`w-full px-3 py-2.5 text-sm rounded-xl border ${errors.wardNo ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-200'} focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all`}
              placeholder="e.g. 16"
            />
            {errors.wardNo && <p className="text-[10px] text-red-500 font-medium">{errors.wardNo}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{language === 'en' ? 'Tole/Village' : 'टोल/गाउँ'}</label>
            <input
              type="text"
              value={formData.tole}
              onChange={e => setFormData(prev => ({ ...prev, tole: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Shantinagar"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('diagnosis')}</label>
            <select
              onChange={e => {
                if (e.target.value) {
                  setFormData(prev => ({ ...prev, diagnosis: e.target.value }));
                }
              }}
              className="text-[10px] bg-neutral-100 border-none rounded px-2 py-0.5 font-medium text-neutral-600 outline-none cursor-pointer hover:bg-neutral-200 transition-colors"
              value=""
            >
              <option value="" disabled>Quick Select...</option>
              {commonDiagnoses.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <textarea
            value={formData.diagnosis}
            onChange={e => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
            className={`w-full px-3 py-2.5 text-sm rounded-xl border ${errors.diagnosis ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-200'} focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all min-h-[80px] resize-y`}
            placeholder="Enter detailed diagnosis..."
          />
          {errors.diagnosis && <p className="text-[10px] text-red-500 font-medium">{errors.diagnosis}</p>}
        </div>

        <div className="space-y-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
          <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-2 uppercase tracking-wider">
            <CalendarIcon className="w-3.5 h-3.5" />
            {t('dialysisType')}
          </h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="dialysisType"
                value="Hemodialysis"
                checked={formData.dialysisType === 'Hemodialysis'}
                onChange={e => setFormData(prev => ({ ...prev, dialysisType: e.target.value as any }))}
                className="w-4 h-4 text-neutral-900 focus:ring-neutral-900"
              />
              <span className="text-sm font-medium text-neutral-700">{t('hemodialysis')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="dialysisType"
                value="CAPD"
                checked={formData.dialysisType === 'CAPD'}
                onChange={e => setFormData(prev => ({ ...prev, dialysisType: e.target.value as any }))}
                className="w-4 h-4 text-neutral-900 focus:ring-neutral-900"
              />
              <span className="text-sm font-medium text-neutral-700">{t('capd')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="dialysisType"
                value="Transplant"
                checked={formData.dialysisType === 'Transplant'}
                onChange={e => setFormData(prev => ({ ...prev, dialysisType: e.target.value as any }))}
                className="w-4 h-4 text-neutral-900 focus:ring-neutral-900"
              />
              <span className="text-sm font-medium text-neutral-700">{t('renalTransplant')}</span>
            </label>
          </div>
        </div>

        <div className="space-y-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
          <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-2 uppercase tracking-wider">
            <CalendarIcon className="w-3.5 h-3.5" />
            {formData.dialysisType === 'Transplant' ? t('transplantDate') : t('dialysisStart')}
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase">BS Date</label>
              <NepaliDatePicker
                value={formData.dialysisStartDateBS || ''}
                onChange={(value) => handleBSDateChange('dialysisStartDateBS', value)}
                options={{ calenderLanguage: language === 'ne' ? 'ne' : 'en', unicodeSupport: false }}
                inputClassName={`w-full px-3 py-2 text-sm rounded-xl border ${errors.dialysisStartDateBS ? 'border-red-500 ring-2 ring-red-500/20' : 'border-neutral-200'} focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all bg-white`}
              />
              {errors.dialysisStartDateBS && (
                <div className="flex items-center gap-1 mt-1 text-red-500">
                  <div className="w-1 h-1 bg-red-500 rounded-full" />
                  <p className="text-[10px] font-bold uppercase tracking-tight">{errors.dialysisStartDateBS}</p>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase">AD Date</label>
              <input
                type="date"
                value={formData.dialysisStartDateAD || ''}
                onChange={e => handleADDateChange('dialysisStartDateAD', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all bg-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
          <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-2 uppercase tracking-wider">
            <CalendarIcon className="w-3.5 h-3.5" />
            {t('issueDate')}
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase">BS Date</label>
              <NepaliDatePicker
                value={formData.issueDateBS || ''}
                onChange={(value) => handleBSDateChange('issueDateBS', value)}
                options={{ calenderLanguage: language === 'ne' ? 'ne' : 'en', unicodeSupport: false }}
                inputClassName={`w-full px-3 py-2 text-sm rounded-xl border ${errors.issueDateBS ? 'border-red-500 ring-2 ring-red-500/20' : 'border-neutral-200'} focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all bg-white`}
              />
              {errors.issueDateBS && (
                <div className="flex items-center gap-1 mt-1 text-red-500">
                  <div className="w-1 h-1 bg-red-500 rounded-full" />
                  <p className="text-[10px] font-bold uppercase tracking-tight">{errors.issueDateBS}</p>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase">AD Date</label>
              <input
                type="date"
                value={formData.issueDateAD || ''}
                onChange={e => handleADDateChange('issueDateAD', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all bg-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('doctor')}</label>
          <select
            required
            value={formData.doctorId}
            onChange={e => handleDoctorChange(e.target.value)}
            className={`w-full px-3 py-2.5 text-sm rounded-xl border ${errors.doctorId ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-200'} focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all`}
          >
            <option value="" disabled>Select a doctor</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          {errors.doctorId && <p className="text-[10px] text-red-500 font-medium">{errors.doctorId}</p>}
        </div>

        <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
          <input
            type="checkbox"
            id="transplant"
            checked={formData.transplantPlanned}
            onChange={e => setFormData(prev => ({ ...prev, transplantPlanned: e.target.checked }))}
            className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
          />
          <label htmlFor="transplant" className="text-xs font-bold text-neutral-700 cursor-pointer">
            {t('plannedForTransplant')}
          </label>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting || Object.keys(errors).length > 0}
          className="w-full flex items-center justify-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-neutral-200"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {t('generateAndSave')}
        </button>
      </div>
    </form>
  );
}
