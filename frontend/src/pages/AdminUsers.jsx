// =============================================
// ADMIN — LEARNER ACCOUNT MANAGEMENT
// =============================================
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader, Plus, X, Copy, AlertTriangle, Check, UserCheck, UserX } from 'lucide-react';
import { SectionHeader, Badge, Button, EmptyState } from '../components/ui/index.jsx';
import { AdminService } from '../services/admin.service.js';

const CATEGORIES = ['student', 'employee', 'both'];

function NewLearnerModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ email: '', name: '', learnerCategory: 'student' });
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  const update = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!form.email.trim() || !form.name.trim()) return toast.error('Email and name are required.');
    setSubmitting(true);
    try {
      const res = await AdminService.createLearner(form);
      setCreated(res.data);
      onCreated();
    } catch (err) {
      toast.error(err.message || 'Could not create learner account.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(created.temporaryPassword);
    setCopied(true);
    toast.success('Copied to clipboard.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6 space-y-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-tx-primary">{created ? 'Learner Created' : 'New Learner Account'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-tx-muted hover:text-tx-primary hover:bg-surface-overlay"><X className="w-4 h-4" /></button>
        </div>

        {!created ? (
          <>
            <div>
              <label className="label">Email Address</label>
              <input type="email" value={form.email} onChange={update('email')} placeholder="learner@sentrilearn.local" className="input-field" />
            </div>
            <div>
              <label className="label">Full Name</label>
              <input type="text" value={form.name} onChange={update('name')} placeholder="e.g. Jordan Reyes" className="input-field" />
            </div>
            <div>
              <label className="label">Category</label>
              <select value={form.learnerCategory} onChange={update('learnerCategory')} className="select-field">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'both' ? 'Students & Employees' : `${c[0].toUpperCase()}${c.slice(1)}`}</option>)}
              </select>
            </div>
            <Button onClick={submit} disabled={submitting} className="w-full justify-center">
              {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Create Account</>}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/[0.08] border border-amber-500/20">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-tx-secondary leading-relaxed">
                <strong className="text-tx-primary">The temporary password is shown once.</strong> Copy it before closing this dialog — it cannot be retrieved or re-displayed later.
              </p>
            </div>
            <div>
              <label className="label">Account</label>
              <p className="text-sm font-semibold text-tx-primary">{created.user.name} — {created.user.email}</p>
            </div>
            <div>
              <label className="label">Temporary Password</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono bg-surface-overlay border border-surface-border rounded-lg px-3 py-2.5 text-tx-primary select-all">{created.temporaryPassword}</code>
                <button onClick={copyPassword} className="btn-secondary px-3 py-2.5 shrink-0">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button onClick={onClose} className="w-full justify-center">Done</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const load = () => AdminService.listLearners().then((res) => setLearners(res.data.users)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const toggleActive = async (learner) => {
    setUpdatingId(learner.id);
    try {
      await AdminService.setLearnerActive(learner.id, !learner.isActive);
      toast.success(`${learner.name} ${learner.isActive ? 'disabled' : 'enabled'}.`);
      load();
    } catch (err) {
      toast.error(err.message || 'Could not update account.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader className="w-6 h-6 text-brand animate-spin" /></div>;

  return (
    <div className="page-wrapper">
      <SectionHeader
        title="Learner Accounts"
        subtitle="Create and manage learner accounts."
        action={<Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> New Learner</Button>}
      />

      {learners.length === 0 ? (
        <EmptyState icon={UserCheck} title="No learners yet" description="Create the first learner account to get started." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-overlay/50">
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-tx-muted">Name</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-tx-muted">Email</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-tx-muted">Category</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-tx-muted">Status</th>
                <th className="text-right px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-tx-muted">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {learners.map((l) => (
                <tr key={l.id} className="hover:bg-surface-overlay/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-tx-primary">{l.name}{l.isDemoAccount && <Badge variant="brand" className="ml-2 text-[9px]">Demo</Badge>}</td>
                  <td className="px-5 py-3 text-tx-secondary font-mono text-xs">{l.email}</td>
                  <td className="px-5 py-3 text-tx-secondary capitalize">{l.learnerCategory}</td>
                  <td className="px-5 py-3"><Badge variant={l.isActive ? 'low' : 'critical'}>{l.isActive ? 'Active' : 'Disabled'}</Badge></td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => toggleActive(l)}
                      disabled={updatingId === l.id}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors disabled:opacity-50 ${
                        l.isActive ? 'border-severity-critical/20 text-severity-critical hover:bg-severity-critical/[0.08]' : 'border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/[0.08]'
                      }`}
                    >
                      {l.isActive ? <><UserX className="w-3.5 h-3.5 inline mr-1" />Disable</> : <><UserCheck className="w-3.5 h-3.5 inline mr-1" />Enable</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <NewLearnerModal onClose={() => setShowModal(false)} onCreated={load} />}
    </div>
  );
}
