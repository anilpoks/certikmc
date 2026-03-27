import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc } from 'firebase/firestore';
import { Edit2, Plus, Trash2, UserPlus, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { Doctor } from '../types';

export default function Settings() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [newDoctor, setNewDoctor] = useState<Partial<Doctor>>({
    name: '',
    designation: '',
    qualifications: '',
    nmcNumber: '',
    department: 'Department of Nephrology'
  });

  useEffect(() => {
    const q = query(collection(db, 'doctors'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const doctorsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Doctor[];
      setDoctors(doctorsList);
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
                placeholder="e.g. MD, DM Nephrology"
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
              <p className="text-neutral-600 font-medium">{doctor.designation}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="bg-neutral-100 text-neutral-600 text-xs px-2 py-1 rounded-lg font-bold uppercase tracking-wider">
                  NMC: {doctor.nmcNumber}
                </span>
                {doctor.qualifications && (
                  <span className="bg-neutral-100 text-neutral-600 text-xs px-2 py-1 rounded-lg font-bold uppercase tracking-wider">
                    {doctor.qualifications}
                  </span>
                )}
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
