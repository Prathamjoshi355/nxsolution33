import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simplified local developer key validation
    if (email === 'admin@nxsolution.in' && password === 'admin123') {
      const user = { name: 'Super Admin', email };
      localStorage.setItem('nx_admin_token', 'dev-token');
      localStorage.setItem('nx_admin_user', JSON.stringify(user));
      onLoginSuccess('dev-token', user);
      navigate('/admin');
    } else {
      setError('Invalid credentials. (Hint: Use admin@nxsolution.in / admin123)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 font-sans text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl relative z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wide uppercase font-mono">Staff Entrance</h1>
            <p className="text-xs text-slate-400">Sign in to access your administrative workspace.</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-950/20 text-rose-400 p-3 rounded-lg border border-rose-500/20 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nxsolution.in"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            <span>Verify & Launch</span>
          </button>
        </form>

        <div className="bg-slate-950/50 rounded-xl border border-slate-800 p-4 text-[11px] text-slate-400 space-y-1">
          <p className="font-bold text-white uppercase tracking-wider text-[9px]">Developer Credentials</p>
          <p>Email: <span className="font-mono text-indigo-400">admin@nxsolution.in</span></p>
          <p>Password: <span className="font-mono text-indigo-400">admin123</span></p>
        </div>
      </div>
    </div>
  );
}
