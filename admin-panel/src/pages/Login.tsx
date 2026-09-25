import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { AdminApi } from '../services/api';
import { Shield, KeyRound, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@tournamentx.com');
  const [password, setPassword] = useState('Admin@123456');
  const [otp2Fa, setOtp2Fa] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await AdminApi.login(email, password, otp2Fa);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 mx-auto flex items-center justify-center font-bold text-black text-2xl shadow-[0_0_25px_rgba(0,240,255,0.4)]">
            X
          </div>
          <h1 className="text-2xl font-bold font-heading tracking-wider text-white">TOURNAMENT X</h1>
          <p className="text-xs text-gray-400">Esports Command & Administration Authority</p>
        </div>

        <GlassCard glow className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                Admin Email ID
              </label>
              <div className="relative mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neonCyan"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                Master Password
              </label>
              <div className="relative mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neonCyan"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                2FA Hardware Authenticator / OTP (Optional)
              </label>
              <div className="relative mt-1">
                <input
                  type="text"
                  placeholder="e.g. 123456"
                  value={otp2Fa}
                  onChange={(e) => setOtp2Fa(e.target.value)}
                  className="w-full bg-surfaceBorder/50 border border-surfaceBorder rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neonCyan font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-neonCyan text-black font-bold text-sm hover:brightness-110 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating Security Token...' : 'Authorize Sign-In'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-surfaceBorder/60 text-center text-[10px] text-gray-500">
            Demo Credentials Pre-filled: <span className="text-neonCyan">admin@tournamentx.com</span> / <span className="text-neonCyan">Admin@123456</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
