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

export interface HospitalSettings {
  id?: string;
  name: string;
  nameNe?: string;
  department: string;
  address: string;
  phone: string;
  logoUrl?: string;
}

export interface PatientRecord {
  id?: string;
  templateId?: CertificateTemplateId;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  nagritaNumber?: string;
  patientPhone?: string;
  district: string;
  municipality: string;
  wardNo: string;
  tole?: string;
  dialysisType?: 'Hemodialysis' | 'CAPD' | 'Transplant';
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
  doctorQualifications: string;
  doctorDepartment: string;
  doctorHospital: string;
  createdAt: any;
  createdBy: string;
}

export interface Municipality {
  name: string;
  nameNe: string;
}

export interface District {
  name: string;
  nameNe: string;
  municipalities: Municipality[];
}
