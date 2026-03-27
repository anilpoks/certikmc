import { District, Doctor } from '../types';

export const DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Assoc. Prof. Dr. ANIL POKHREL',
    designation: 'Consultant Nephrologist',
    qualifications: 'MD, DM Nephrology',
    nmcNumber: '3112',
    department: 'Department of Nephrology'
  },
  {
    id: '2',
    name: 'Dr. BINOD SHRESTHA',
    designation: 'Consultant Nephrologist',
    qualifications: 'MD, DM Nephrology',
    nmcNumber: '4567',
    department: 'Department of Nephrology'
  }
];

export const DISTRICTS: District[] = [
  {
    name: 'Kathmandu',
    municipalities: [
      'Kathmandu Metropolitan City',
      'Kirtipur Municipality',
      'Budhanilkantha Municipality',
      'Tarakeshwar Municipality',
      'Gokarneshwar Municipality',
      'Tokha Municipality',
      'Nagarjun Municipality',
      'Chandragiri Municipality',
      'Kageshwari Manohara Municipality',
      'Shankharapur Municipality',
      'Dakshinkali Municipality'
    ]
  },
  {
    name: 'Lalitpur',
    municipalities: [
      'Lalitpur Metropolitan City',
      'Mahalaxmi Municipality',
      'Godawari Municipality',
      'Konjyosom Rural Municipality',
      'Bagmati Rural Municipality',
      'Mahankal Rural Municipality'
    ]
  },
  {
    name: 'Bhaktapur',
    municipalities: [
      'Bhaktapur Municipality',
      'Madhyapur Thimi Municipality',
      'Suryabinayak Municipality',
      'Changunarayan Municipality'
    ]
  },
  {
    name: 'Jhapa',
    municipalities: [
      'Birtamod Municipality',
      'Damak Municipality',
      'Mechinagar Municipality',
      'Bhadrapur Municipality',
      'Arjundhara Municipality',
      'Kankai Municipality',
      'Shivasataksi Municipality',
      'Gauradaha Municipality'
    ]
  },
  {
    name: 'Morang',
    municipalities: [
      'Biratnagar Metropolitan City',
      'Belbari Municipality',
      'Urlabari Municipality',
      'Pathari Shanishchare Municipality',
      'Sundar Haraicha Municipality',
      'Ratuwamai Municipality',
      'Sunawarshi Municipality',
      'Letang Municipality'
    ]
  }
];

export const COMMON_DIAGNOSES = [
  'Chronic Kidney Disease Stage-V, HTN, DM-II',
  'Chronic Kidney Disease Stage-V, HTN',
  'Chronic Kidney Disease Stage-V, DM-II',
  'End Stage Renal Disease (ESRD)',
  'Acute Kidney Injury (AKI)',
  'Nephrotic Syndrome'
];
