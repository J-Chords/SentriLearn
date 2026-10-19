// =============================================
// ADMIN — PRACTICE REPORT REVIEW
// A compact review queue, not a full ticketing system.
// =============================================
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader, Clock } from 'lucide-react';
import { SectionHeader, Badge, EmptyState } from '../components/ui/index.jsx';
import { ReportService } from '../services/reports.service.js';
import { formatDate } from '../utils/helpers.js';

const STATUS_VARIANT = { received: 'ghost', reviewed: 'medium', closed: 'low' };
const NEXT_STATUS = { received: 'reviewed', reviewed: 'closed', closed: null };

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = () => ReportService.listAll().then((res) => setReports(res.data.reports)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const advance = async (report) => {
    const next = NEXT_STATUS[report.status];
    if (!next) return;
    setUpdatingId(report.id);
    try {
      await ReportService.updateStatus(report.id, next);
      toast.success(`Marked as ${next}`);
      load();
    } catch (err) {
      toast.error(err.message || 'Could not update report.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader className="w-6 h-6 text-brand animate-spin" /></div>;

  return (
    <div className="page-wrapper">
      <SectionHeader title="Practice Report Review" subtitle="Review suspicious-message reports submitted by learners." />

      {reports.length === 0 ? (
        <EmptyState icon={Clock} title="No reports yet" description="Learner-submitted practice reports will appear here." />
      ) : (
        <div className="card divide-y divide-surface-border overflow-hidden">
          {reports.map((r) => (
            <div key={r.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-tx-primary">{r.userName} — {r.messageType}</p>
                <p className="text-xs text-tx-secondary mt-0.5">{r.reasons.join(', ')}</p>
                {r.notes && <p className="text-xs text-tx-muted mt-1 italic">"{r.notes}"</p>}
                <p className="text-[11px] text-tx-muted mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(r.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={STATUS_VARIANT[r.status]} className="capitalize">{r.status}</Badge>
                {NEXT_STATUS[r.status] && (
                  <button
                    onClick={() => advance(r)}
                    disabled={updatingId === r.id}
                    className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-50"
                  >
                    Mark {NEXT_STATUS[r.status]}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
