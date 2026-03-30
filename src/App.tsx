import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, query } from 'firebase/firestore';
import { FilePlus, History, LogOut, Settings as SettingsIcon, User as UserIcon, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import CertificateForm from './components/CertificateForm';
import CertificatePreview from './components/CertificatePreview';
import HistoryTable from './components/HistoryTable';
import Login from './components/Login';
import Settings from './components/Settings';
import { auth, db } from './firebase';
import { HospitalSettings, PatientRecord, User } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

type View = 'form' | 'history' | 'preview' | 'settings';

function AppContent() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'staff' | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentView, setCurrentView] = useState<View>('form');
  const [selectedRecord, setSelectedRecord] = useState<Partial<PatientRecord> | null>(null);
  const [liveData, setLiveData] = useState<Partial<PatientRecord>>({});
  const { language, setLanguage, t } = useLanguage();

  const Logo = () => {
    const [logoSrc, setLogoSrc] = useState("https://kmc.edu.np/wp-content/uploads/2023/06/kmc-logo.png");

    useEffect(() => {
      const q = query(collection(db, 'hospitalSettings'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const settings = snapshot.docs[0].data() as HospitalSettings;
          if (settings.logoUrl) {
            setLogoSrc(settings.logoUrl);
          }
        }
      });
      return () => unsubscribe();
    }, []);

    return (
      <img 
        src={logoSrc} 
        alt="KMC Logo" 
        className="w-10 h-14 object-contain"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
      />
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        } else {
          // Default admin for the main user, others staff
          const role = user.email === "nephrokmc@gmail.com" ? 'admin' : 'staff';
          setUserRole(role);
        }
      } else {
        setUserRole(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => signOut(auth);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 print:bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo />
              <div>
                <h1 className="text-lg font-bold tracking-tight text-neutral-900">{t('systemTitle')}</h1>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em]">{t('systemSubtitle')}</p>
              </div>
            </div>

          <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-2xl">
            <button
              onClick={() => setCurrentView('form')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                currentView === 'form' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <FilePlus className="w-4 h-4" />
              {t('liveEditor')}
            </button>
            <button
              onClick={() => setCurrentView('history')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                currentView === 'history' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <History className="w-4 h-4" />
              {t('history')}
            </button>
            {userRole === 'admin' && (
              <button
                onClick={() => setCurrentView('settings')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                  currentView === 'settings' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <SettingsIcon className="w-4 h-4" />
                {t('settings')}
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <div className="flex items-center bg-neutral-100 p-1 rounded-xl">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  language === 'en' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ne')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  language === 'ne' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400'
                }`}
              >
                ने
              </button>
            </div>

            <div className="flex items-center gap-3 pr-4 border-r border-neutral-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">{user.displayName}</p>
                <p className="text-[10px] text-neutral-500 font-medium">{user.email}</p>
              </div>
              <div className="bg-neutral-100 p-2 rounded-xl">
                <UserIcon className="w-5 h-5 text-neutral-600" />
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
              title={t('logout')}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8 print:p-0 print:m-0 print:max-w-none">
        {currentView === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Form */}
            <div className="lg:col-span-4 sticky top-28 space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-200">
                <h2 className="text-xl font-bold text-neutral-900 mb-2">Patient Entry</h2>
                <p className="text-neutral-500 text-sm mb-6">Fill patient details to update the certificate in real-time.</p>
                <CertificateForm 
                  onSuccess={(record) => {
                    setSelectedRecord(record);
                    setCurrentView('preview');
                  }} 
                  onChange={(data) => setLiveData(data)}
                />
              </div>
            </div>

            {/* Live Preview Editor */}
            <div className="lg:col-span-8">
              <div className="bg-neutral-200 p-8 rounded-[40px] shadow-inner min-h-[1200px] flex flex-col items-center">
                <div className="mb-6 flex items-center gap-3 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">Live Editor Window</span>
                </div>
                <div className="w-full transform scale-[0.9] origin-top">
                  <CertificatePreview record={liveData} />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'history' && (
          <div className="space-y-12 print:hidden">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-4xl font-bold tracking-tight text-neutral-900 mb-4">{t('history')}</h2>
              <p className="text-neutral-500 text-lg">
                Access and manage all previously generated medical certificates.
              </p>
            </div>
            <HistoryTable 
              onView={(record) => {
                setSelectedRecord(record);
                setCurrentView('preview');
              }} 
            />
          </div>
        )}

        {currentView === 'preview' && selectedRecord && (
          <div className="space-y-12">
            <div className="flex items-center justify-between max-w-4xl mx-auto print:hidden">
              <button
                onClick={() => setCurrentView(selectedRecord.id ? 'history' : 'form')}
                className="text-neutral-500 font-semibold hover:text-neutral-900 transition-colors flex items-center gap-2"
              >
                ← {selectedRecord.id ? t('backToHistory') : t('backToForm')}
              </button>
              <h2 className="text-2xl font-bold text-neutral-900">Certificate Preview</h2>
              <div className="w-24" /> {/* Spacer */}
            </div>
            <CertificatePreview record={selectedRecord} />
          </div>
        )}

        {currentView === 'settings' && userRole === 'admin' && (
          <div className="space-y-12 print:hidden">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-4xl font-bold tracking-tight text-neutral-900 mb-4">{t('settings')}</h2>
              <p className="text-neutral-500 text-lg">
                Manage doctors and system configurations.
              </p>
            </div>
            <Settings />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-neutral-200 text-center print:hidden">
        <p className="text-neutral-400 text-sm font-medium uppercase tracking-widest">
          {language === 'ne' ? 'काठमाडौं मेडिकल कलेज पब्लिक लिमिटेड' : 'Kathmandu Medical College Public Limited'} • {t('departmentOfNephrology')}
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
