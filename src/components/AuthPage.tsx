import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DisabilityType } from '../types';
import { Eye, EyeOff, UserPlus, LogIn, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

type AuthTab = 'login' | 'signup';

const DISABILITY_OPTIONS: { value: DisabilityType; label: string; emoji: string }[] = [
  { value: 'wheelchair', label: 'Wheelchair User / Mobility Impaired', emoji: '♿' },
  { value: 'mobility', label: 'Physical / Mobility Impairment', emoji: '🦽' },
  { value: 'visual', label: 'Visual Impairment / Blindness', emoji: '🦯' },
  { value: 'hearing', label: 'Hearing Impairment / Deafness', emoji: '👂' },
  { value: 'cognitive', label: 'Cognitive / Learning Difficulty', emoji: '🧠' },
  { value: 'senior', label: 'Senior Citizen with Mobility Needs', emoji: '🧓' },
  { value: 'multiple', label: 'Multiple Disabilities', emoji: '⚕️' },
  { value: 'caregiver', label: 'Caregiver / Family Member', emoji: '🤝' },
];

export const AuthPage: React.FC = () => {
  const { signup, login, authError, clearAuthError, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<AuthTab>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup fields
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupDisability, setSignupDisability] = useState<DisabilityType>('wheelchair');

  // Inline validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Clear errors when switching tabs
  useEffect(() => {
    clearAuthError();
    setFieldErrors({});
    setSuccessMsg(null);
  }, [tab, clearAuthError]);

  const validateLogin = (): boolean => {
    const errs: Record<string, string> = {};
    if (!loginEmail.trim()) errs.loginEmail = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) errs.loginEmail = 'Enter a valid email address.';
    if (!loginPassword) errs.loginPassword = 'Password is required.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateSignup = (): boolean => {
    const errs: Record<string, string> = {};
    if (!signupFullName.trim()) errs.signupFullName = 'Full name is required.';
    if (!signupEmail.trim()) errs.signupEmail = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) errs.signupEmail = 'Enter a valid email address.';
    if (!signupPassword) errs.signupPassword = 'Password is required.';
    else if (signupPassword.length < 6) errs.signupPassword = 'Password must be at least 6 characters.';
    if (!signupConfirmPassword) errs.signupConfirmPassword = 'Please confirm your password.';
    else if (signupPassword !== signupConfirmPassword) errs.signupConfirmPassword = 'Passwords do not match.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setIsSubmitting(true);
    clearAuthError();
    await login(loginEmail.trim(), loginPassword);
    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignup()) return;
    setIsSubmitting(true);
    clearAuthError();
    const ok = await signup(signupFullName.trim(), signupEmail.trim(), signupPassword, signupDisability);
    setIsSubmitting(false);
    if (ok) {
      setSuccessMsg(`Welcome to AccessiGo, ${signupFullName.trim().split(' ')[0]}! 🎉`);
    }
  };

  // While checking existing session on mount
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-white to-[#FFF7ED] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-[#1E3A8A]">
          <div className="w-14 h-14 rounded-full border-4 border-blue-200 border-t-[#1E3A8A] animate-spin" />
          <p className="font-bold text-base">Loading AccessiGo…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-white to-[#FFF7ED] flex flex-col items-center justify-center px-4 py-10">

      {/* Branding */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1E3A8A] text-white font-black text-3xl shadow-lg mb-4">
          A
        </div>
        <h1 className="text-4xl font-black text-[#1E3A8A] tracking-tight">
          Accessi<span className="text-[#F59E0B]">Go</span>
        </h1>
        <p className="text-sm font-semibold text-slate-500 mt-1">
          Accessible Route Planning · Barangay Sta. Rita, Olongapo City
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-slate-100 overflow-hidden">

        {/* Tab switcher */}
        <div className="flex border-b-2 border-slate-100">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-4 flex items-center justify-center gap-2 font-extrabold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400 ${
              tab === 'login'
                ? 'bg-[#1E3A8A] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Log In
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            className={`flex-1 py-4 flex items-center justify-center gap-2 font-extrabold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400 ${
              tab === 'signup'
                ? 'bg-[#1E3A8A] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Create Account
          </button>
        </div>

        <div className="p-6 sm:p-8">

          {/* Global error banner */}
          {authError && (
            <div role="alert" className="mb-5 flex items-start gap-3 p-4 bg-red-50 border-2 border-red-300 rounded-2xl text-red-800 text-sm font-bold">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <span>{authError}</span>
            </div>
          )}

          {/* Success banner */}
          {successMsg && (
            <div role="status" className="mb-5 flex items-start gap-3 p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-800 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} noValidate className="space-y-5" aria-label="Login form">
              <div>
                <label htmlFor="login-email" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={loginEmail}
                  onChange={e => { setLoginEmail(e.target.value); setFieldErrors(p => ({ ...p, loginEmail: '' })); }}
                  placeholder="your@email.com"
                  className={`w-full px-4 py-3.5 rounded-xl border-2 text-base font-semibold text-slate-900 bg-slate-50 focus:outline-none focus:border-[#1E3A8A] transition-colors ${
                    fieldErrors.loginEmail ? 'border-red-400 bg-red-50' : 'border-slate-200'
                  }`}
                />
                {fieldErrors.loginEmail && (
                  <p className="mt-1 text-xs font-bold text-red-600">{fieldErrors.loginEmail}</p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={e => { setLoginPassword(e.target.value); setFieldErrors(p => ({ ...p, loginPassword: '' })); }}
                    placeholder="Enter your password"
                    className={`w-full px-4 py-3.5 pr-12 rounded-xl border-2 text-base font-semibold text-slate-900 bg-slate-50 focus:outline-none focus:border-[#1E3A8A] transition-colors ${
                      fieldErrors.loginPassword ? 'border-red-400 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.loginPassword && (
                  <p className="mt-1 text-xs font-bold text-red-600">{fieldErrors.loginPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#1E3A8A] hover:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 mt-2"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Logging in…</>
                ) : (
                  <><LogIn className="w-5 h-5" /> Log In to AccessiGo</>
                )}
              </button>

              <p className="text-center text-sm text-slate-500 font-medium pt-1">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className="text-[#1E3A8A] font-extrabold underline underline-offset-2 hover:text-blue-700 focus:outline-none"
                >
                  Create one here
                </button>
              </p>
            </form>
          )}

          {/* ── SIGNUP FORM ── */}
          {tab === 'signup' && (
            <form onSubmit={handleSignup} noValidate className="space-y-4" aria-label="Sign up form">

              <div>
                <label htmlFor="signup-name" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  value={signupFullName}
                  onChange={e => { setSignupFullName(e.target.value); setFieldErrors(p => ({ ...p, signupFullName: '' })); }}
                  placeholder="e.g. Juan dela Cruz"
                  className={`w-full px-4 py-3.5 rounded-xl border-2 text-base font-semibold text-slate-900 bg-slate-50 focus:outline-none focus:border-[#1E3A8A] transition-colors ${
                    fieldErrors.signupFullName ? 'border-red-400 bg-red-50' : 'border-slate-200'
                  }`}
                />
                {fieldErrors.signupFullName && (
                  <p className="mt-1 text-xs font-bold text-red-600">{fieldErrors.signupFullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={signupEmail}
                  onChange={e => { setSignupEmail(e.target.value); setFieldErrors(p => ({ ...p, signupEmail: '' })); }}
                  placeholder="your@email.com"
                  className={`w-full px-4 py-3.5 rounded-xl border-2 text-base font-semibold text-slate-900 bg-slate-50 focus:outline-none focus:border-[#1E3A8A] transition-colors ${
                    fieldErrors.signupEmail ? 'border-red-400 bg-red-50' : 'border-slate-200'
                  }`}
                />
                {fieldErrors.signupEmail && (
                  <p className="mt-1 text-xs font-bold text-red-600">{fieldErrors.signupEmail}</p>
                )}
              </div>

              <div>
                <label htmlFor="signup-disability" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Primary Disability / Role
                </label>
                <select
                  id="signup-disability"
                  value={signupDisability}
                  onChange={e => setSignupDisability(e.target.value as DisabilityType)}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 text-base font-semibold text-slate-900 bg-slate-50 focus:outline-none focus:border-[#1E3A8A] transition-colors"
                >
                  {DISABILITY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.emoji} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Password <span className="font-medium text-slate-400">(min. 6 characters)</span>
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={signupPassword}
                    onChange={e => { setSignupPassword(e.target.value); setFieldErrors(p => ({ ...p, signupPassword: '' })); }}
                    placeholder="Create a password"
                    className={`w-full px-4 py-3.5 pr-12 rounded-xl border-2 text-base font-semibold text-slate-900 bg-slate-50 focus:outline-none focus:border-[#1E3A8A] transition-colors ${
                      fieldErrors.signupPassword ? 'border-red-400 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.signupPassword && (
                  <p className="mt-1 text-xs font-bold text-red-600">{fieldErrors.signupPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="signup-confirm-password" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={signupConfirmPassword}
                    onChange={e => { setSignupConfirmPassword(e.target.value); setFieldErrors(p => ({ ...p, signupConfirmPassword: '' })); }}
                    placeholder="Re-enter your password"
                    className={`w-full px-4 py-3.5 pr-12 rounded-xl border-2 text-base font-semibold text-slate-900 bg-slate-50 focus:outline-none focus:border-[#1E3A8A] transition-colors ${
                      fieldErrors.signupConfirmPassword ? 'border-red-400 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(p => !p)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.signupConfirmPassword && (
                  <p className="mt-1 text-xs font-bold text-red-600">{fieldErrors.signupConfirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#1E3A8A] hover:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 mt-2"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Creating account…</>
                ) : (
                  <><UserPlus className="w-5 h-5" /> Create My Account</>
                )}
              </button>

              <p className="text-center text-sm text-slate-500 font-medium pt-1">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-[#1E3A8A] font-extrabold underline underline-offset-2 hover:text-blue-700 focus:outline-none"
                >
                  Log in here
                </button>
              </p>
            </form>
          )}

        </div>
      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs text-slate-400 font-medium text-center max-w-sm">
        Your data is stored locally and securely on this device. AccessiGo is a barangay community accessibility tool for Sta. Rita, Olongapo City.
      </p>
    </div>
  );
};
