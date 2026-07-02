import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, ArrowRight, Loader2, CheckCircle2, ShieldCheck, Inbox } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'form' | 'sent' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the app settings.');
      setLoading(false);
      return;
    }

    try {
      // Use the current origin for redirect. 
      // Ensure this URL is whitelisted in Supabase -> Auth -> URL Configuration -> Redirect URLs
      const redirectUrl = window.location.origin;
      
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (signInError) throw signInError;
      
      setStep('sent');
    } catch (err: any) {
      console.error('[AUTH] Supabase error:', err);
      let msg = err.message || 'Failed to send sign-in link. Please try again.';
      if (msg.includes('redirect')) {
        msg = 'Redirect URL error. Please ensure your App URL is added to the "Redirect URLs" in Supabase Authentication settings.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the app settings.');
      setLoading(false);
      return;
    }

    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (googleError) throw googleError;
    } catch (err: any) {
      console.error('[AUTH] Google Sign-In error:', err);
      setError(err.message || 'Failed to sign in with Google.');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8 md:p-10">
              <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-600/20 mb-6">
                  {step === 'sent' ? <Inbox className="w-8 h-8 text-white" /> : step === 'success' ? <CheckCircle2 className="w-8 h-8 text-white" /> : <ShieldCheck className="w-8 h-8 text-white" />}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {step === 'form' ? 'Sign in to VoiceAgent' : step === 'sent' ? 'Check your email' : 'Welcome back!'}
                </h2>
                <p className="text-slate-500">
                  {step === 'form' ? "We'll send a secure login link to your inbox." : step === 'sent' ? `We sent a magic link to ${email}` : "You're successfully signed in."}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                  {error}
                </div>
              )}

              {step === 'form' && (
                <div className="space-y-6">
                  <form onSubmit={handleSendLink} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Send Magic Link</span> <ArrowRight className="w-5 h-5" /></>}
                    </button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-4 text-slate-400 font-medium">Or continue with</span>
                    </div>
                  </div>

                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-4 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </button>

                  <p className="text-xs text-slate-400 text-center">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              )}

              {step === 'sent' && (
                <div className="space-y-6 text-center">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                    <p className="text-sm text-blue-700 leading-relaxed">
                      We've sent a login link to <strong>{email}</strong>.<br />Click the link to be signed in automatically.
                    </p>
                  </div>
                  <button
                    onClick={() => setStep('form')}
                    className="text-blue-600 text-sm font-semibold hover:underline"
                  >
                    Use a different email
                  </button>
                  <p className="text-xs text-slate-400">
                    If you don't see the email, check your spam folder.
                  </p>
                </div>
              )}

              {step === 'success' && (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center space-x-2 text-green-600 font-medium">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Preparing your workspace...</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
