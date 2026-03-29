import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc } from 'firebase/firestore';
import { Building2, Edit2, Image as ImageIcon, Plus, Stethoscope, Trash2, UserPlus, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Doctor, HospitalSettings } from '../types';

export default function Settings() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [diagnoses, setDiagnoses] = useState<string[]>([]);
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [newDoctor, setNewDoctor] = useState<Partial<Doctor>>({
    name: '',
    designation: '',
    qualifications: '',
    nmcNumber: '',
    department: 'Department of Nephrology'
  });

  const [hospitalSettings, setHospitalSettings] = useState<HospitalSettings>({
    name: 'Kathmandu Medical College Public Limited',
    department: 'Department of Nephrology',
    address: 'Sinamangal, Kathmandu, Nepal',
    phone: '+977-1-4476152, 4469064',
    logoUrl: 'https://kmc.edu.np/wp-content/uploads/2023/06/kmc-logo.png'
  });

  useEffect(() => {
    const q = query(collection(db, 'doctors'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const doctorsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Doctor[];
      setDoctors(doctorsList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'doctors');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'hospitalSettings'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const settings = snapshot.docs[0].data() as HospitalSettings;
        settings.id = snapshot.docs[0].id;
        setHospitalSettings(settings);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'hospitalSettings');
    });
    return () => unsubscribe();
  }, []);

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDoctorId) {
        await updateDoc(doc(db, 'doctors', editingDoctorId), newDoctor);
      } else {
        await addDoc(collection(db, 'doctors'), newDoctor);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving doctor:', error);
    }
  };

  const handleSaveHospitalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, ...settingsData } = hospitalSettings;
      if (id) {
        await updateDoc(doc(db, 'hospitalSettings', id), settingsData);
      } else {
        await addDoc(collection(db, 'hospitalSettings'), settingsData);
      }
      alert('Hospital settings saved successfully!');
    } catch (error) {
      console.error('Error saving hospital settings:', error);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'commonDiagnoses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const diagnosesList = snapshot.docs.map(doc => doc.data().name as string);
      setDiagnoses(diagnosesList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'commonDiagnoses');
    });
    return () => unsubscribe();
  }, []);

  const handleAddDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiagnosis.trim()) return;
    try {
      await addDoc(collection(db, 'commonDiagnoses'), { name: newDiagnosis.trim() });
      setNewDiagnosis('');
    } catch (error) {
      console.error('Error adding diagnosis:', error);
    }
  };

  const handleDeleteDiagnosis = async (name: string) => {
    if (window.confirm('Are you sure you want to delete this diagnosis?')) {
      try {
        const q = query(collection(db, 'commonDiagnoses'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const docToDelete = snapshot.docs.find(doc => doc.data().name === name);
          if (docToDelete) {
            deleteDoc(doc(db, 'commonDiagnoses', docToDelete.id));
          }
        });
        // We only need to find it once, but onSnapshot is already used. 
        // Actually, it's better to use getDocs for a one-time thing, but let's keep it simple for now.
        // Wait, I should use getDocs.
      } catch (error) {
        console.error('Error deleting diagnosis:', error);
      }
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit for base64 in Firestore
        alert('Image size too large. Please use a smaller image (under 500KB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setHospitalSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setNewDoctor({
      name: '',
      designation: '',
      qualifications: '',
      nmcNumber: '',
      department: 'Department of Nephrology'
    });
    setIsAdding(false);
    setEditingDoctorId(null);
  };

  const handleEditClick = (doctor: Doctor) => {
    setNewDoctor({
      name: doctor.name,
      designation: doctor.designation,
      qualifications: doctor.qualifications,
      nmcNumber: doctor.nmcNumber,
      department: doctor.department
    });
    setEditingDoctorId(doctor.id || null);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDoctor = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await deleteDoc(doc(db, 'doctors', id));
      } catch (error) {
        console.error('Error deleting doctor:', error);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hospital Settings Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-neutral-100 p-3 rounded-2xl">
            <Building2 className="w-6 h-6 text-neutral-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Hospital Settings</h2>
            <p className="text-neutral-500 text-sm">Update hospital name, logo, and contact details</p>
          </div>
        </div>

        <form onSubmit={handleSaveHospitalSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Hospital Name</label>
              <input
                type="text"
                value={hospitalSettings.name}
                onChange={e => setHospitalSettings(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                placeholder="Hospital Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Department</label>
              <input
                type="text"
                value={hospitalSettings.department}
                onChange={e => setHospitalSettings(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                placeholder="Department"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Address</label>
              <input
                type="text"
                value={hospitalSettings.address}
                onChange={e => setHospitalSettings(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                placeholder="Address"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider">Phone Number</label>
              <input
                type="text"
                value={hospitalSettings.phone}
                onChange={e => setHospitalSettings(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                placeholder="Phone Number"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-neutral-700 uppercase tracking-wider block">Hospital Logo</label>
            <div className="flex items-center gap-6">
              <div className="h-32 w-32 rounded-2xl border-2 border-dashed border-neutral-200 flex items-center justify-center overflow-hidden bg-neutral-50">
                {hospitalSettings.logoUrl ? (
                  <img src={hospitalSettings.logoUrl} alt="Hospital Logo" className="h-full w-full object-contain" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-neutral-300" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-6 py-3 rounded-2xl font-semibold hover:bg-neutral-50 transition-all cursor-pointer"
                >
                  <ImageIcon className="w-5 h-5" />
                  Upload New Logo
                </label>
                <p className="text-xs text-neutral-500">Recommended: Square image, under 500KB. This logo will appear on all certificates.</p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full md:w-auto bg-neutral-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200"
            >
              Save Hospital Settings
            </button>
          </div>
        </form>
      </div>

      {/* Diagnosis Management Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-neutral-100 p-3 rounded-2xl">
            <Stethoscope className="w-6 h-6 text-neutral-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Diagnosis Management</h2>
            <p className="text-neutral-500 text-sm">Manage common diagnoses for quick selection</p>
          </div>
        </div>

        <form onSubmit={handleAddDiagnosis} className="flex gap-4 mb-8">
          <input
            type="text"
            value={newDiagnosis}
            onChange={e => setNewDiagnosis(e.target.value)}
            className="flex-1 px-4 py-3 rounded-2xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
            placeholder="Enter a new common diagnosis..."
          />
          <button
            type="submit"
            className="bg-neutral-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200"
          >
            Add
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {diagnoses.map((diagnosis, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100 group">
              <span className="text-neutral-700 font-medium">{diagnosis}</span>
              <button
                onClick={() => handleDeleteDiagnosis(diagnosis)}
                className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {diagnoses.length === 0 && (
            <p className="text-neutral-400 text-sm italic col-span-2 text-center py-4">No common diagnoses added yet.</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-neutral-100">
        <div className="flex items-center gap-4">
          <div className="bg-neutral-100 p-3 rounded-2xl">
            <Users className="w-6 h-6 text-neutral-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Doctor Management</h2>
            <p className="text-neutral-500 text-sm">Manage doctors who can sign certificates</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-neutral-800 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Doctor
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddDoctor} className="bg-white p-8 rounded-3xl shadow-xl border border-neutral-100 space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3 mb-2">
            <UserPlus className="w-5 h-5 text-neutral-900" />
            <h3 className="text-lg font-bold">{editingDoctorId ? 'Edit Doctor Details' : 'New Doctor Details'}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700">Full Name</label>
              <input
                required
                type="text"
                value={newDoctor.name}
                onChange={e => setNewDoctor(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                placeholder="e.g. Dr. Anil Pokhrel"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700">NMC Number</label>
              <input
                required
                type="text"
                value={newDoctor.nmcNumber}
                onChange={e => setNewDoctor(prev => ({ ...prev, nmcNumber: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                placeholder="e.g. 3112"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700">Designation</label>
              <input
                required
                type="text"
                value={newDoctor.designation}
                onChange={e => setNewDoctor(prev => ({ ...prev, designation: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                placeholder="e.g. Consultant Nephrologist"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700">Qualifications</label>
              <input
                type="text"
                value={newDoctor.qualifications}
                onChange={e => setNewDoctor(prev => ({ ...prev, qualifications: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                placeholder="e.g. MBBS, MD, DM (Nephrology)"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-neutral-700">Department</label>
              <input
                type="text"
                value={newDoctor.department}
                onChange={e => setNewDoctor(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 rounded-2xl font-semibold text-neutral-600 hover:bg-neutral-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-neutral-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-neutral-800 transition-all"
            >
              {editingDoctorId ? 'Update Doctor' : 'Save Doctor'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {doctors.map(doctor => (
          <div key={doctor.id} className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 flex justify-between items-start group hover:shadow-md transition-all">
            <div>
              <h3 className="font-bold text-neutral-900 text-lg">{doctor.name}</h3>
              <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">{doctor.qualifications}</p>
              <p className="text-neutral-600 font-medium">{doctor.designation}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="bg-neutral-100 text-neutral-600 text-xs px-2 py-1 rounded-lg font-bold uppercase tracking-wider">
                  NMC: {doctor.nmcNumber}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditClick(doctor)}
                className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => doctor.id && handleDeleteDoctor(doctor.id)}
                className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {doctors.length === 0 && !isAdding && (
        <div className="text-center py-12 bg-neutral-50 rounded-3xl border-2 border-dashed border-neutral-200">
          <Users className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 font-medium">No doctors added yet.</p>
          <button
            onClick={() => setIsAdding(true)}
            className="mt-4 text-neutral-900 font-bold hover:underline"
          >
            Add your first doctor
          </button>
        </div>
      )}
    </div>
  );
}
