// =============================================
// REPORT A SUSPICIOUS MESSAGE
// =============================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Flag, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { SectionHeader, Button, Badge } from '../components/ui/index.jsx';
import { ReportService } from '../services/reports.service.js';
import { formatDate } from '../utils/helpers.js';

const MESSAGE_TYPES = ['Email', 'SMS', 'Messaging App', 'Social Media', 'Other'];
const CONCERN_REASONS = ['Suspicious sender', 'Urgent request', 'Credential request', 'Suspicious link', 'Unexpected attachment', 'Other'];
const STATUS_VARIANT = { received: 'ghost', reviewed: 'medium', closed: 'low' };

export default function Report() {
  const [messageType, setMessageType] = useState(MESSAGE_TYPES[0]);
  const [reasons, setReasons] = useState([]);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myReports, setMyReports] = useState([]);

  const loadMine = () => ReportService.listMine().then((res) => setMyReports(res.data.reports)).catch(() => {});
  useEffect(() => { loadMine(); }, []);

  const toggleReason = (r) => setReasons((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reasons.length === 0) return toast.error('Select at least one reason for concern.');
    setSubmitting(true);
    try {
      await ReportService.submit({ messageType, reasons, notes: notes || undefined });
      setSubmitted(true);
      loadMine();
    } catch (err) {
      toast.error(err.message || 'Could not submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => { setMessageType(MESSAGE_TYPES[0]); setReasons([]); setNotes(''); setSubmitted(false); };

  if (submitted) {
    return (
      <div className="page-wrapper max-w-lg mx-auto text-center">
        <div className="flex flex-col items-center gap-4 py-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-8 h-8" /></div>
          <h1 className="text-xl font-bold text-tx-primary">Report Submitted</h1>
          <p className="text-sm text-tx-secondary leading-relaxed">
            Thank you. Your report has been saved in SentriLearn for review. Reporting suspicious messages is an important cybersecurity habit.
          </p>
          <div className="flex gap-3 mt-2">
            <button onClick={reset} className="btn-secondary">Report Another</button>
            <Link to="/dashboard" className="btn-primary">Return to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper max-w-lg mx-auto">
      <SectionHeader title="Report a Suspicious Message" subtitle="Help keep your community safe by flagging suspicious communications." />

      <div className="card p-3 flex items-start gap-2.5 bg-amber-500/[0.06] border-amber-500/20">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-tx-secondary leading-relaxed">
          Do not enter passwords, verification codes, banking information or other sensitive data in this form.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">Message Type</label>
          <select value={messageType} onChange={(e) => setMessageType(e.target.value)} className="select-field">
            {MESSAGE_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Reason for Concern</label>
          <div className="grid grid-cols-2 gap-2">
            {CONCERN_REASONS.map((r) => (
              <label key={r} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${reasons.includes(r) ? 'border-brand bg-brand/[0.08] text-tx-primary' : 'border-surface-border text-tx-secondary hover:bg-surface-overlay'}`}>
                <input type="checkbox" checked={reasons.includes(r)} onChange={() => toggleReason(r)} className="accent-brand w-3.5 h-3.5" />
                {r}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Optional Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} maxLength={1000} placeholder="Add any additional context (do not include sensitive data)..." className="input-field resize-none" />
        </div>

        <Button type="submit" disabled={submitting} className="w-full justify-center py-3 font-semibold">
          <Flag className="w-4 h-4" /> {submitting ? 'Submitting…' : 'Submit Report'}
        </Button>
      </form>

      {myReports.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-tx-muted px-1">My Reports</h3>
          <div className="card divide-y divide-surface-border overflow-hidden">
            {myReports.map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-tx-primary">{r.messageType} — {r.reasons.join(', ')}</p>
                  <p className="text-[11px] text-tx-muted mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(r.createdAt)}</p>
                </div>
                <Badge variant={STATUS_VARIANT[r.status]} className="shrink-0 capitalize">{r.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
