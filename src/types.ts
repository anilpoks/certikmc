export interface Doctor {
  id?: string;
  name: string;
  designation: string;
  qualifications: string;
  nmcNumber: string;
  department: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'staff';
}

export type CertificateTemplateId = 'standard' | 'modern' | 'classic';

export interface PatientRecord {
  id?: string;
  templateId?: CertificateTemplateId;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  nagritaNumber?: string;
  district: string;
  municipality: string;
  wardNo: string;
  diagnosis: string;
  dialysisStartDateBS?: string;
  dialysisStartDateAD?: string;
  issueDateBS: string;
  issueDateAD: string;
  transplantPlanned: boolean;
  doctorId: string;
  doctorName: string;
  doctorNmc: string;
  doctorDesignation: string;
  doctorDepartment: string;
  doctorHospital: string;
  createdAt: any;
  createdBy: string;
}

export interface District {
  name: string;
  municipalities: string[];
}
