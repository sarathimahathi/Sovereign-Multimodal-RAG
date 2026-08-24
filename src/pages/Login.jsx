import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkbench } from '../context/WorkbenchContext';
import OngcMrplLogo from '../components/OngcMrplLogo';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Globe,
  HelpCircle,
  Database,
  Shield,
  KeyRound,
  AlertCircle,
} from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useWorkbench();

  // Pre-fill default demo credentials so user can click Sign In immediately
  const [email, setEmail] = useState('operator@mrpl.co.in');
  const [password, setPassword] = useState('mrpl2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const executeSignIn = (userEmail, userPass) => {
    const finalEmail = userEmail || 'operator@mrpl.co.in';
    setIsSubmitting(true);
    login({
      email: finalEmail,
      name: finalEmail.includes('@') ? finalEmail.split('@')[0] : finalEmail,
    });
    navigate('/dashboard');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    executeSignIn(email, password);
  };

  const handleDemoSignIn = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
    executeSignIn(demoEmail, demoPass);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans flex flex-col justify-between relative overflow-hidden select-none">
      {/* HUD Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-sky-500/10 via-purple-500/10 to-indigo-500/10 rounded-full blur-[140px] pointer-events-none -z-0"></div>

      {/* TOP BAR: Branding & Utility Controls */}
      <header className="px-8 py-5 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-4">
          <OngcMrplLogo size="large" />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 font-sans">
              MRPL Sovereign AI Workbench
            </h1>
            <p className="text-xs text-sky-400 font-medium tracking-wide">
              Secure. On-Premise. Confidential.
            </p>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111827] border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>{selectedLanguage}</span>
              <span className="text-[10px] text-slate-500">▾</span>
            </button>
          </div>

          <button
            onClick={() => alert('MRPL IT Helpdesk: Contact extension 4400 or email security@mrpl.co.in')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#111827] border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>Need Help?</span>
          </button>
        </div>
      </header>

      {/* MAIN SPLIT CONTENT AREA */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-2 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 relative">
        {/* LEFT COLUMN: Industrial Refinery Visuals & Technical Overlay */}
        <div className="lg:col-span-7 relative h-[500px] lg:h-[540px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-end p-8 group">
          {/* Clean high quality refinery background image */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src="/mrpl_refinery.jpg"
              alt="MRPL Refinery Infrastructure"
              className="w-full h-full object-cover object-center scale-100 transition-transform duration-1000 ease-out group-hover:scale-105"
            />
            {/* Dark Navy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/80 to-[#0b0f19]/40"></div>
          </div>

          {/* Minimal HUD Radar Circular Overlay Graphic */}
          <div className="absolute top-1/2 right-12 -translate-y-1/2 w-64 h-64 border border-sky-500/20 rounded-full flex items-center justify-center pointer-events-none z-10 animate-pulse-subtle">
            <div className="w-48 h-48 border border-purple-500/15 rounded-full flex items-center justify-center">
              <div className="w-32 h-32 border border-sky-500/10 rounded-full"></div>
            </div>
            <div className="absolute top-6 right-10 w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]"></div>
          </div>

          {/* HUD Polygon Accent Graphics */}
          <div className="absolute bottom-6 left-8 z-10 space-y-1 pointer-events-none">
            <div className="flex items-center gap-1">
              <div className="w-16 h-[2px] bg-sky-500/70"></div>
              <div className="w-3 h-3 border-r-2 border-t-2 border-sky-400/70 rotate-45"></div>
            </div>
            <div className="w-28 h-[1.5px] bg-purple-500/30"></div>
          </div>

          {/* Refinery Content Overlay Text */}
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827]/90 border border-sky-500/40 text-sky-300 text-xs font-mono font-bold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              ON-PREMISE CONFIDENTIAL SANDBOX
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
              Mangalore Refinery and Petrochemicals Limited
            </h2>
            <p className="text-xs text-slate-300 max-w-lg leading-relaxed font-sans drop-shadow">
              Autonomous Agentic AI Workbench powered by open-weight LLMs running exclusively inside MRPL's isolated air-gapped data center infrastructure.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Translucent Login Form */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md bg-[#111827]/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 relative transition-all duration-300 animate-fade-in-up">
            {/* Top Lock/Shield Emblem */}
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-13 h-13 rounded-full border border-sky-500/40 bg-sky-950/80 text-sky-400 flex items-center justify-center shadow-inner">
                <Lock className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Hello!</h2>
                <p className="text-sm font-semibold text-slate-400 mt-0.5">Welcome Back</p>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1">
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Email"
                    className="w-full pl-10 pr-4 py-3 bg-[#090d16] text-white font-semibold border border-slate-800 rounded-xl text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-10 pr-10 py-3 bg-[#090d16] text-white font-semibold border border-slate-800 rounded-xl text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('operator@mrpl.co.in', 'mrpl2026')}
                    className="text-xs text-sky-400 hover:underline font-semibold transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Submit Button (Primary Sky Blue Button) */}
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-[0.98] text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-sky-950/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>

            {/* Quick Demo Login Preset Buttons */}
            <div className="text-center space-y-2 pt-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                Quick Demo Credentials
              </span>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('operator@mrpl.co.in', 'mrpl2026')}
                  className="px-3 py-1 rounded-lg bg-[#090d16] hover:bg-[#182235] border border-slate-800 text-[11px] text-sky-300 font-mono transition-colors cursor-pointer"
                >
                  Operator Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('auditor@mrpl.co.in', 'mrpl2026')}
                  className="px-3 py-1 rounded-lg bg-[#090d16] hover:bg-[#182235] border border-slate-800 text-[11px] text-purple-300 font-mono transition-colors cursor-pointer"
                >
                  Auditor Demo
                </button>
              </div>
            </div>

            {/* SSO Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-800 w-full"></div>
              <span className="bg-[#111827] px-3 text-[11px] text-slate-400 font-medium shrink-0">
                Or continue with
              </span>
              <div className="border-t border-slate-800 w-full"></div>
            </div>

            {/* SSO Option Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleDemoSignIn('sso.microsoft@mrpl.co.in', 'sso2026')}
                className="flex items-center justify-center p-2.5 rounded-xl bg-[#090d16] border border-slate-800 hover:border-sky-500 transition-all cursor-pointer group"
                title="Sign in with Microsoft 365 Enterprise"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23" fill="none">
                  <path fill="#F35325" d="M1 1h10v10H1z" />
                  <path fill="#81BC06" d="M12 1h10v10H12z" />
                  <path fill="#05A6F0" d="M1 12h10v10H1z" />
                  <path fill="#FFBA08" d="M12 12h10v10H12z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSignIn('sso.google@mrpl.co.in', 'sso2026')}
                className="flex items-center justify-center p-2.5 rounded-xl bg-[#090d16] border border-slate-800 hover:border-sky-500 transition-all cursor-pointer group"
                title="Sign in with Google Workspace"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSignIn('sso.enterprise@mrpl.co.in', 'sso2026')}
                className="flex items-center justify-center p-2.5 rounded-xl bg-[#090d16] border border-slate-800 hover:border-sky-500 transition-all cursor-pointer group"
                title="Sign in with Enterprise Security Shield"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              </button>
            </div>

            {/* Bottom Create Account Link */}
            <div className="text-center text-xs text-slate-400 font-sans pt-1">
              <span>Don't have an account? </span>
              <button
                type="button"
                onClick={() => handleDemoSignIn('newuser@mrpl.co.in', 'mrpl2026')}
                className="text-sky-400 font-bold hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM INFORMATION BAR */}
      <div className="px-8 py-3 max-w-7xl mx-auto w-full z-20 relative">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 rounded-lg bg-[#090d16] border border-slate-800 text-sky-400 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">100% On-Premise</h4>
              <p className="text-[11px] text-slate-400">No External Data Transfer</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 pt-2 sm:pt-0">
            <div className="p-2 rounded-lg bg-[#090d16] border border-slate-800 text-purple-400 shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Secure Infrastructure</h4>
              <p className="text-[11px] text-slate-400">Enterprise Grade Security</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 pt-2 lg:pt-0">
            <div className="p-2 rounded-lg bg-[#090d16] border border-slate-800 text-indigo-400 shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Data Sovereignty</h4>
              <p className="text-[11px] text-slate-400">Complete Data Control</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 pt-2 lg:pt-0">
            <div className="p-2 rounded-lg bg-[#090d16] border border-slate-800 text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Air-Gapped Ready</h4>
              <p className="text-[11px] text-slate-400">Zero Outbound Leakage</p>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="py-3 text-center text-[11px] text-slate-500 font-sans border-t border-slate-800/80 z-20 relative bg-[#090d16]">
        © 2026 Mangalore Refinery and Petrochemicals Limited (MRPL). All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
