import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { AlertCircle, LogIn } from 'lucide-react';
import { useState } from 'react';
import { auth } from '../firebase';

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Login failed:', err);
      let message = 'An unexpected error occurred during sign in.';
      if (err.code === 'auth/unauthorized-domain') {
        message = 'This domain is not authorized for sign-in. Please contact the administrator to add this URL to the Firebase authorized domains list.';
      } else if (err.code === 'auth/popup-blocked') {
        message = 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
        <div className="mb-6">
          <img 
            src="https://kmc.edu.np/wp-content/uploads/2023/06/kmc-logo.png" 
            alt="KMC Logo" 
            className="w-32 h-48 mx-auto object-contain mb-6"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Kathmandu_Medical_College_Logo.png/220px-Kathmandu_Medical_College_Logo.png";
            }}
          />
          <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">KMC Nephrology</h1>
          <p className="text-neutral-500 font-medium mt-2">Certificate Management System</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}
        
        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="flex items-center justify-center gap-3 w-full bg-neutral-900 text-white py-4 rounded-2xl font-semibold hover:bg-neutral-800 transition-all disabled:opacity-50"
        >
          {isLoggingIn ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Sign in with Google
            </>
          )}
        </button>
        
        <p className="mt-6 text-xs text-neutral-400">
          Authorized personnel only. Please sign in with your KMC email.
        </p>
      </div>
    </div>
  );
}
