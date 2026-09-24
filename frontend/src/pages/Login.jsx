// =============================================
// LOGIN / WELCOME PAGE
// =============================================
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck, Mail, Lock, ArrowRight, GraduationCap, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user, loginAs } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;

  const enterAs = (role) => {
    loginAs(role);
    toast.success(`Signed in as ${role === 'admin' ? 'Demo Administrator' : 'Demo Learner'}`);
    navigate(role === 'admin' ? '/admin' : '/dashboard');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // No real authentication backend — demo mode always signs in as a learner.
    enterAs('learner');
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center shadow-lg shadow-brand/20 mb-4">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-tx-primary tracking-tight">SentriLearn</h1>
          <p className="text-sm text-tx-secondary mt-1">Cybersecurity Awareness &amp; Phishing Prevention</p>
        </div>

        <div className="card p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-tx-primary">Welcome Back</h2>
            <p className="text-xs text-tx-muted mt-1">Sign in to continue your training.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-tx-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-tx-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-tx-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="accent-brand w-3.5 h-3.5"
                />
                Remember Me
              </label>
              <span className="text-tx-muted">Forgot password?</span>
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-3 font-semibold">
              Sign In
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 divider" />
            <span className="text-[10px] font-semibold text-tx-muted uppercase tracking-widest">or try the demo</span>
            <div className="flex-1 divider" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => enterAs('learner')}
              className="btn-secondary w-full justify-center py-2.5"
            >
              <GraduationCap className="w-4 h-4" />
              Demo Learner
            </button>
            <button
              onClick={() => enterAs('admin')}
              className="btn-secondary w-full justify-center py-2.5"
            >
              <ShieldAlert className="w-4 h-4" />
              Demo Administrator
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-tx-muted mt-6 font-medium tracking-wide">
          Learn. Identify. Report. Stay Secure.
        </p>
      </div>
    </div>
  );
}
