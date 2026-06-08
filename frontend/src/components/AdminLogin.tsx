import React, { useState } from 'react';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5000';

export default function AdminLogin({ onLoginSuccess }: { onLoginSuccess: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        onLoginSuccess(data.token);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-950 relative overflow-hidden font-sans">
      {/* Animated background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 bg-white/5 backdrop-blur-2xl p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 text-center tracking-tight">Host Portal</h2>
        <p className="text-slate-400 text-center mb-8 text-sm">Sign in to manage your cricket box bookings</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Admin Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-4 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
              placeholder="Arsalan@boxcricket.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-4 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold p-4 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-4 group flex items-center justify-center gap-2"
          >
            Access Dashboard
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
