import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Sparkles, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: { email: string; name: string; role?: string }) => void;
  initialMode?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'signup' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // Create user document in Firestore
        let userRole = 'user';
        if (email === 'admin@voiceagent.com' && password === 'VoiceAdmin#2026Secure!') {
           userRole = 'admin';
        }
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: userCredential.user.email,
          name: name,
          plan: 'free',
          totalMessages: 0,
          role: userRole,
          createdAt: new Date().toISOString()
        });
        
        if (onSuccess) {
          onSuccess({ email: userCredential.user.email || email, name, role: userRole });
        }
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        let role = 'user';
        let displayName = userCredential.user.displayName || 'User';
        
        try {
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            displayName = data.name || displayName;
            role = data.role || role;
          }
        } catch (docError) {
          console.error("Failed to fetch user role", docError);
        }
        
        if (email === 'admin@voiceagent.com' && password === 'VoiceAdmin#2026Secure!') {
           role = 'admin';
        }
        
        if (onSuccess) {
          onSuccess({ email: userCredential.user.email || email, name: displayName, role });
        }
      }
      setLoading(false);
      onClose();
    } catch (err: any) {
      console.error(err);
      
      let friendlyError = 'Authentication failed. Please try again.';
      const errorCode = err.code || '';
      
      if (errorCode === 'auth/email-already-in-use' || err.message?.includes('email-already-in-use')) {
        friendlyError = 'This email is already registered. Please sign in instead.';
      } else if (errorCode === 'auth/invalid-credential' || err.message?.includes('invalid-credential')) {
        friendlyError = 'Invalid email or password. Please try again.';
      } else if (errorCode === 'auth/user-not-found' || err.message?.includes('user-not-found')) {
        friendlyError = 'No account found with this email.';
      } else if (errorCode === 'auth/wrong-password' || err.message?.includes('wrong-password')) {
        friendlyError = 'Incorrect password. Please try again.';
      } else if (errorCode === 'auth/weak-password' || err.message?.includes('weak-password')) {
        friendlyError = 'Password should be at least 6 characters.';
      } else if (errorCode === 'auth/invalid-email' || err.message?.includes('invalid-email')) {
        friendlyError = 'Please enter a valid email address.';
      } else if (errorCode === 'auth/too-many-requests' || err.message?.includes('too-many-requests')) {
        friendlyError = 'Too many attempts. Please try again later.';
      } else if (err.message) {
        friendlyError = err.message.replace('Firebase: ', '').trim();
      }
      
      setError(friendlyError);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[400px] max-h-[calc(100vh-2rem)] bg-white rounded-[24px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
          >
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shrink-0" />

            <button 
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-5 md:p-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex items-start space-x-4 mb-5">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                  <Sparkles className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    {mode === 'signup' ? 'Create an Account' : 'Welcome Back'}
                  </h2>
                  <p className="text-slate-500 text-[11px] mt-0.5 font-medium leading-relaxed">
                    {mode === 'signup' 
                      ? 'Join thousands of businesses managing files' 
                      : 'Sign in to continue managing your agents'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-2.5 rounded-xl text-xs flex items-start space-x-2">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 ml-1">Display Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-xs text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-xs text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[11px] font-bold text-slate-700">Password</label>
                    {mode === 'signin' && (
                      <button type="button" className="text-[10px] text-indigo-600 font-bold hover:underline">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-xs text-slate-900 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4F46E5] text-white font-bold py-3 rounded-xl hover:bg-[#4338CA] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed mt-1"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="text-sm">{mode === 'signup' ? 'Sign Up' : 'Sign In'}</span>
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button 
                    onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    {mode === 'signup' ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

