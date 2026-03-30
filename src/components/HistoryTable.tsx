import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Eye, FileText, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { PatientRecord } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedDistrictName } from '../utils/nepal-utils';

interface HistoryTableProps {
  onView: (record: PatientRecord) => void;
}

export default function HistoryTable({ onView }: HistoryTableProps) {
  const { t, formatNumber, language } = useLanguage();
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'records'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PatientRecord));
      setRecords(data);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching records:', error);
      handleFirestoreError(error, OperationType.GET, 'records');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredRecords = (records || []).filter(r => 
    (r.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.district || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-6xl mx-auto">
      <div className="p-8 border-b flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-neutral-100 p-3 rounded-2xl">
            <FileText className="w-6 h-6 text-neutral-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{t('certificateHistory')}</h2>
            <p className="text-neutral-500 text-sm">{t('viewHistoryDesc')}</p>
          </div>
        </div>

        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 text-neutral-500 text-sm uppercase tracking-wider">
            <tr>
              <th className="px-8 py-4 font-semibold">{t('patientName')}</th>
              <th className="px-8 py-4 font-semibold">{t('district')}</th>
              <th className="px-8 py-4 font-semibold">{t('dialysisType')}</th>
              <th className="px-8 py-4 font-semibold">{t('issueDate')} (BS)</th>
              <th className="px-8 py-4 font-semibold">{t('doctor')}</th>
              <th className="px-8 py-4 font-semibold">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-neutral-400">
                  <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4" />
                  {t('loadingRecords')}
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-neutral-400">
                  {t('noRecords')}
                </td>
              </tr>
            ) : (
              filteredRecords.map(record => (
                <tr key={record.id} className="hover:bg-neutral-50 transition-colors group">
                  <td className="px-8 py-5 font-medium text-neutral-900">{record.patientName}</td>
                  <td className="px-8 py-5 text-neutral-600">{getLocalizedDistrictName(record.district, language)}</td>
                  <td className="px-8 py-5 text-neutral-600">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      record.dialysisType === 'CAPD' ? 'bg-blue-50 text-blue-600' : 
                      record.dialysisType === 'Transplant' ? 'bg-green-50 text-green-600' : 
                      'bg-neutral-100 text-neutral-600'
                    }`}>
                      {record.dialysisType === 'CAPD' ? t('capd') : 
                       record.dialysisType === 'Transplant' ? t('renalTransplant') : 
                       t('hemodialysis')}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-neutral-600">{formatNumber(record.issueDateBS)}</td>
                  <td className="px-8 py-5 text-neutral-600">{record.doctorName}</td>
                  <td className="px-8 py-5">
                    <button
                      onClick={() => onView(record)}
                      className="flex items-center gap-2 text-neutral-900 font-semibold hover:text-neutral-500 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      {t('view')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
