// =============================================
// LOGIN / WELCOME PAGE — real authentication
// =============================================
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Info, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (loading) return null;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedInUser = await login(email, password, remember);
      navigate(loggedInUser.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Sign in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md animate-fade-in">
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
                  required
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
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-medium text-severity-critical bg-severity-critical/[0.08] border border-severity-critical/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-tx-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="accent-brand w-3.5 h-3.5"
                />
                Remember Me (30 days)
              </label>
              <span className="text-tx-muted" title="Account recovery is administrator-assisted for this release.">
                Forgot password?
              </span>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3 font-semibold disabled:opacity-60">
              {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-surface-overlay border border-surface-border">
            <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <p className="text-[11px] text-tx-secondary leading-relaxed">
              This is a bounded academic demo. Fictional demo accounts (e.g. <span className="font-mono">alex.morgan@sentrilearn.local</span>)
              sign in through this same real form — ask your administrator for the current password.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-tx-muted mt-6 font-medium tracking-wide">
          Learn. Identify. Report. Stay Secure.
        </p>
      </div>
    </div>
  );
}
