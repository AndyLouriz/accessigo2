import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Eye, EyeOff, UserPlus, LogIn, Loader2, AlertCircle,
  CheckCircle2, ShieldCheck,
} from 'lucide-react';

type AuthTab = 'login' | 'signup';



/* ── Accessible input wrapper ─────────────────────────────────────────────── */
interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
  suffix?: React.ReactNode;
  hint?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  id, label, type = 'text', value, onChange, placeholder, error, autoComplete, suffix, hint,
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-bold text-slate-700">
      {label}
      {hint && <span className="ml-2 text-xs font-normal text-slate-400">{hint}</span>}
    </label>
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full px-4 py-3.5 rounded-xl border-2 text-base font-medium text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none transition-colors ${
          suffix ? 'pr-12' : ''
        } ${
          error
            ? 'border-red-400 bg-red-50 focus:border-red-500'
            : 'border-slate-200 focus:border-[#1E3A8A] hover:border-slate-300'
        }`}
      />
      {suffix && (
        <div className="absolute right-0 top-0 h-full flex items-center pr-3">
          {suffix}
        </div>
      )}
    </div>
    {error && (
      <p id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        {error}
      </p>
    )}
  </div>
);

/* ── Password toggle button ────────────────────────────────────────────────── */
const PwToggle: React.FC<{ show: boolean; onToggle: () => void }> = ({ show, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={show ? 'Hide password' : 'Show password'}
    className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded-lg transition-colors"
  >
    {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
  </button>
);

/* ── Main AuthPage ─────────────────────────────────────────────────────────── */
export const AuthPage: React.FC = () => {
  const { signup, login, authError, clearAuthError, isLoading: authLoading } = useAuth();

  const [tab, setTab]                       = useState<AuthTab>('login');
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [showPw, setShowPw]                 = useState(false);
  const [showConfirmPw, setShowConfirmPw]   = useState(false);
  const [successMsg, setSuccessMsg]         = useState<string | null>(null);
  const [fieldErrors, setFieldErrors]       = useState<Record<string, string>>({});

  // Login
  const [loginEmail, setLoginEmail]         = useState('');
  const [loginPassword, setLoginPassword]   = useState('');

  // Signup
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  useEffect(() => {
    clearAuthError();
    setFieldErrors({});
    setSuccessMsg(null);
  }, [tab, clearAuthError]);

  /* ── Validation ──────────────────────────────────────────────────────────── */
  const validateLogin = () => {
    const e: Record<string, string> = {};
    if (!loginEmail.trim())                                   e.loginEmail    = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) e.loginEmail    = 'Enter a valid email address.';
    if (!loginPassword)                                       e.loginPassword = 'Password is required.';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateSignup = () => {
    const e: Record<string, string> = {};
    if (!name.trim())                                         e.name    = 'Full name is required.';
    if (!email.trim())                                        e.email   = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))      e.email   = 'Enter a valid email address.';
    if (!password)                                            e.pw      = 'Password is required.';
    else if (password.length < 6)                             e.pw      = 'Password must be at least 6 characters.';
    if (!confirmPw)                                           e.cpw     = 'Please confirm your password.';
    else if (password !== confirmPw)                          e.cpw     = 'Passwords do not match.';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Handlers ────────────────────────────────────────────────────────────── */
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
    const ok = await signup(name.trim(), email.trim(), password, 'wheelchair');
    setIsSubmitting(false);
    if (ok) setSuccessMsg(`Welcome, ${name.trim().split(' ')[0]}! Setting up your profile…`);
  };

  /* ── Loading splash ──────────────────────────────────────────────────────── */
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-white to-[#FFF7ED] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1E3A8A] flex items-center justify-center text-white font-black text-3xl shadow-xl animate-pulse">
            A
          </div>
          <div className="flex items-center gap-2 text-[#1E3A8A] font-bold text-base">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading AccessiGo…
          </div>
        </div>
      </div>
    );
  }

  /* ── Main render ─────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-white to-[#FFF7ED] flex flex-col">

      {/* Top decorative bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#F59E0B]" />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:py-14">

        {/* ── Branding block ────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-white font-black text-4xl shadow-2xl mb-5 ring-4 ring-blue-200">
            A
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[#1E3A8A] tracking-tight">
            Accessi<span className="text-[#F59E0B]">Go</span>
          </h1>
          <p className="text-sm text-slate-500 font-semibold mt-2 tracking-wide">
            Accessible Route Planning · Barangay Sta. Rita, Olongapo City
          </p>

          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 mt-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            WCAG 2.1 AAA · PWD-Friendly Design
          </div>
        </div>

        {/* ── Auth card ─────────────────────────────────────────────────── */}
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">

            {/* Tab bar */}
            <div className="flex border-b-2 border-slate-100" role="tablist" aria-label="Authentication options">
              {(['login', 'signup'] as AuthTab[]).map(t => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 font-extrabold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 ${
                    tab === t
                      ? 'bg-[#1E3A8A] text-white'
                      : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {t === 'login' ? <><LogIn className="w-4 h-4" /> Log In</> : <><UserPlus className="w-4 h-4" /> Create Account</>}
                </button>
              ))}
            </div>

            <div className="p-6 sm:p-8">

              {/* Error banner */}
              {authError && (
                <div role="alert" aria-live="assertive" className="mb-6 flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-red-700 leading-snug">{authError}</p>
                </div>
              )}

              {/* Success banner */}
              {successMsg && (
                <div role="status" aria-live="polite" className="mb-6 flex items-start gap-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-emerald-700 leading-snug">{successMsg}</p>
                </div>
              )}

              {/* ── LOGIN FORM ─────────────────────────────────────────── */}
              {tab === 'login' && (
                <form onSubmit={handleLogin} noValidate aria-label="Login form" className="space-y-5">
                  <InputField
                    id="login-email"
                    label="Email Address"
                    type="email"
                    value={loginEmail}
                    onChange={v => { setLoginEmail(v); setFieldErrors(p => ({ ...p, loginEmail: '' })); }}
                    placeholder="your@email.com"
                    error={fieldErrors.loginEmail}
                    autoComplete="email"
                  />
                  <InputField
                    id="login-password"
                    label="Password"
                    type={showPw ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={v => { setLoginPassword(v); setFieldErrors(p => ({ ...p, loginPassword: '' })); }}
                    placeholder="Enter your password"
                    error={fieldErrors.loginPassword}
                    autoComplete="current-password"
                    suffix={<PwToggle show={showPw} onToggle={() => setShowPw(p => !p)} />}
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 mt-1 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] hover:from-[#1e40af] hover:to-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
                  >
                    {isSubmitting
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Logging in…</>
                      : <><LogIn className="w-5 h-5" /> Log In to AccessiGo</>
                    }
                  </button>

                  <p className="text-center text-sm text-slate-500 pt-1">
                    No account?{' '}
                    <button type="button" onClick={() => setTab('signup')}
                      className="text-[#1E3A8A] font-bold underline underline-offset-2 hover:text-blue-700 focus:outline-none">
                      Create one here
                    </button>
                  </p>
                </form>
              )}

              {/* ── SIGNUP FORM ────────────────────────────────────────── */}
              {tab === 'signup' && (
                <form onSubmit={handleSignup} noValidate aria-label="Sign up form" className="space-y-4">
                  <InputField
                    id="signup-name"
                    label="Full Name"
                    value={name}
                    onChange={v => { setName(v); setFieldErrors(p => ({ ...p, name: '' })); }}
                    placeholder="e.g. Juan dela Cruz"
                    error={fieldErrors.name}
                    autoComplete="name"
                  />
                  <InputField
                    id="signup-email"
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={v => { setEmail(v); setFieldErrors(p => ({ ...p, email: '' })); }}
                    placeholder="your@email.com"
                    error={fieldErrors.email}
                    autoComplete="email"
                  />



                  <InputField
                    id="signup-password"
                    label="Password"
                    hint="(min. 6 characters)"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={v => { setPassword(v); setFieldErrors(p => ({ ...p, pw: '' })); }}
                    placeholder="Create a password"
                    error={fieldErrors.pw}
                    autoComplete="new-password"
                    suffix={<PwToggle show={showPw} onToggle={() => setShowPw(p => !p)} />}
                  />
                  <InputField
                    id="signup-confirm-password"
                    label="Confirm Password"
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPw}
                    onChange={v => { setConfirmPw(v); setFieldErrors(p => ({ ...p, cpw: '' })); }}
                    placeholder="Re-enter your password"
                    error={fieldErrors.cpw}
                    autoComplete="new-password"
                    suffix={<PwToggle show={showConfirmPw} onToggle={() => setShowConfirmPw(p => !p)} />}
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 mt-1 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] hover:from-[#1e40af] hover:to-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
                  >
                    {isSubmitting
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating account…</>
                      : <><UserPlus className="w-5 h-5" /> Create My Account</>
                    }
                  </button>

                  <p className="text-center text-sm text-slate-500 pt-1">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setTab('login')}
                      className="text-[#1E3A8A] font-bold underline underline-offset-2 hover:text-blue-700 focus:outline-none">
                      Log in here
                    </button>
                  </p>
                </form>
              )}

            </div>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-slate-400 leading-relaxed px-4">
            🔒 Your data is stored securely and locally. AccessiGo is a community accessibility tool for{' '}
            <strong className="text-slate-500">Sta. Rita, Olongapo City</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
