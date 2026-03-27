import { addDoc, collection, onSnapshot, query, serverTimestamp } from 'firebase/firestore';
import { Calendar as CalendarIcon, CheckCircle, Save, User } from 'lucide-react';
import NepaliDate from 'nepali-date-converter';
import React, { useEffect, useState } from 'react';
import { NepaliDatePicker } from 'nepali-datepicker-reactjs';
import 'nepali-datepicker-reactjs/dist/index.css';
import { COMMON_DIAGNOSES, DISTRICTS } from '../data/nepal-data';
import { auth, db } from '../firebase';
import { Doctor, PatientRecord } from '../types';

interface CertificateFormProps {
  onSuccess: (record: PatientRecord) => void;
  onChange?: (data: Partial<PatientRecord>) => void;
}

export default function CertificateForm({ onSuccess, onChange }: CertificateFormProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [formData, setFormData] = useState<Partial<PatientRecord>>({
    templateId: 'standard',
    patientName: '',
    age: 0,
    gender: 'Male',
    nagritaNumber: '',
    district: DISTRICTS[0].name,
    municipality: DISTRICTS[0].municipalities[0],
    wardNo: '',
    diagnosis: COMMON_DIAGNOSES[0],
    issueDateBS: new NepaliDate().format('YYYY/MM/DD'),
    issueDateAD: new NepaliDate().toJsDate().toISOString().split('T')[0],
    transplantPlanned: false,
    doctorId: '',
    doctorName: '',
    doctorNmc: '',
    doctorDesignation: '',
    doctorDepartment: '',
    doctorHospital: 'Kathmandu Medical College Public Limited',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.patientName || formData.patientName.trim().length < 3) {
      newErrors.patientName = 'Patient name must be at least 3 characters';
    }
    
    if (!formData.district) {
      newErrors.district = 'District is required';
    }

    if (!formData.age || formData.age <= 0) {
      newErrors.age = 'Valid age is required';
    }

    if (!formData.wardNo) {
      newErrors.wardNo = 'Ward number is required';
    }

    if (!formData.diagnosis || formData.diagnosis.trim().length === 0) {
      newErrors.diagnosis = 'Diagnosis is required';
    }

    if (!formData.doctorId) {
      newErrors.doctorId = 'Please select a doctor';
    }

    // Date validation
    const dateRegex = /^\d{4}[\/\-]\d{2}[\/\-]\d{2}$/;
    
    if (!formData.issueDateBS || !dateRegex.test(formData.issueDateBS)) {
      newErrors.issueDateBS = 'Invalid Nepali date format (YYYY/MM/DD)';
    } else {
      try {
        new NepaliDate(formData.issueDateBS);
      } catch (e) {
        newErrors.issueDateBS = 'Invalid Nepali date';
      }
    }

    if (formData.dialysisStartDateBS) {
      if (!dateRegex.test(formData.dialysisStartDateBS)) {
        newErrors.dialysisStartDateBS = 'Invalid Nepali date format (YYYY/MM/DD)';
      } else {
        try {
          new NepaliDate(formData.dialysisStartDateBS);
        } catch (e) {
          newErrors.dialysisStartDateBS = 'Invalid Nepali date';
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
          doctorDepartment: doctor.department,
          doctorHospital: 'Kathmandu Medical College Public Limited',
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleBSDateChange = (field: 'issueDateBS' | 'dialysisStartDateBS', value: string) => {
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
    try {
      const adDate = new Date(value);
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
      district: 'Kathmandu',
      municipality: 'Kathmandu Metropolitan City',
      wardNo: '16',
      diagnosis: 'Chronic Kidney Disease (CKD) Stage V, Hypertension (HTN), Diabetes Mellitus Type II (DM-II)',
      dialysisStartDateBS: '2080/04/15',
      dialysisStartDateAD: '2023/07/31',
      issueDateBS: todayBS,
      issueDateAD: todayAD,
      transplantPlanned: true,
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
            <h2 className="text-lg font-bold text-neutral-900">Patient Details</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={fillSampleData}
          className="text-[10px] font-bold text-neutral-500 hover:text-neutral-900 transition-colors bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100 uppercase tracking-wider"
        >
          Fill Sample
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Template</label>
          <select
            value={formData.templateId}
            onChange={e => setFormData(prev => ({ ...prev, templateId: e.target.value as any }))}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all"
          >
            <option value="standard">Standard (Official KMC)</option>
            <option value="modern">Modern (Minimalist)</option>
            <option value="classic">Classic (Formal Border)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Patient Name</label>
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

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Age</label>
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
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Gender</label>
            <select
              value={formData.gender}
              onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">District</label>
          <select
            value={formData.district}
            onChange={e => {
              const district = DISTRICTS.find(d => d.name === e.target.value);
              setFormData(prev => ({
                ...prev,
                district: e.target.value,
                municipality: district?.municipalities[0] || ''
              }));
            }}
            className={`w-full px-3 py-2.5 text-sm rounded-xl border ${errors.district ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-200'} focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all`}
          >
            {DISTRICTS.map(d => (
              <option key={d.name} value={d.name}>{d.name}</option>
            ))}
          </select>
          {errors.district && <p className="text-[10px] text-red-500 font-medium">{errors.district}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Municipality</label>
            <select
              value={formData.municipality}
              onChange={e => setFormData(prev => ({ ...prev, municipality: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all"
            >
              {DISTRICTS.find(d => d.name === formData.district)?.municipalities.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Ward</label>
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
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Diagnosis</label>
          <input
            type="text"
            list="diagnosis-options"
            value={formData.diagnosis}
            onChange={e => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
            className={`w-full px-3 py-2.5 text-sm rounded-xl border ${errors.diagnosis ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-200'} focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all`}
            placeholder="Select or type diagnosis..."
          />
          <datalist id="diagnosis-options">
            {COMMON_DIAGNOSES.map(d => (
              <option key={d} value={d} />
            ))}
          </datalist>
          {errors.diagnosis && <p className="text-[10px] text-red-500 font-medium">{errors.diagnosis}</p>}
        </div>

        <div className="space-y-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
          <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-2 uppercase tracking-wider">
            <CalendarIcon className="w-3.5 h-3.5" />
            Dialysis Start
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase">BS Date</label>
              <NepaliDatePicker
                value={formData.dialysisStartDateBS || ''}
                onChange={(value) => handleBSDateChange('dialysisStartDateBS', value)}
                options={{ calenderLanguage: "en", unicodeSupport: false }}
                inputClassName={`w-full px-3 py-2 text-sm rounded-xl border ${errors.dialysisStartDateBS ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-200'} focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all bg-white`}
              />
              {errors.dialysisStartDateBS && <p className="text-[10px] text-red-500 font-medium">{errors.dialysisStartDateBS}</p>}
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
            Issue Date
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase">BS Date</label>
              <NepaliDatePicker
                value={formData.issueDateBS || ''}
                onChange={(value) => handleBSDateChange('issueDateBS', value)}
                options={{ calenderLanguage: "en", unicodeSupport: false }}
                inputClassName={`w-full px-3 py-2 text-sm rounded-xl border ${errors.issueDateBS ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-200'} focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all bg-white`}
              />
              {errors.issueDateBS && <p className="text-[10px] text-red-500 font-medium">{errors.issueDateBS}</p>}
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
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Doctor</label>
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
            Planned for Transplant
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
          Generate & Save
        </button>
      </div>
    </form>
  );
}
