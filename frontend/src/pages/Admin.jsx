// =============================================
// ADMIN ANALYTICS DASHBOARD
// =============================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, Gauge, Flag, Clock, Inbox, Loader, Info } from 'lucide-react';
import { SectionHeader, ProgressBar, RiskBadge, Badge } from '../components/ui/index.jsx';
import { StatsCard } from '../components/dashboard/StatsCard.jsx';
import { AnalyticsService } from '../services/analytics.service.js';
import { resolveActivityIcon } from '../utils/iconMap.js';

const RISK_BAR_COLOR = { low: 'green', medium: 'amber', high: 'red' };

export default function Admin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AnalyticsService.getAdmin().then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-24"><Loader className="w-6 h-6 text-brand animate-spin" /></div>;
  if (!data) return null;

  return (
    <div className="page-wrapper">
      <SectionHeader
        title="SentriLearn Administrator Analytics"
        subtitle="Organization-wide training performance and phishing awareness metrics."
        action={<Link to="/admin/reports" className="btn-secondary"><Inbox className="w-4 h-4" /> Report Review</Link>}
      />

      {data.includesDemoAccounts && (
        <div className="card p-3 flex items-center gap-2.5 bg-brand/[0.05] border-brand/20">
          <Info className="w-4 h-4 text-brand shrink-0" />
          <p className="text-xs text-tx-secondary">
            <strong className="text-tx-primary">These figures include demo data.</strong> One or more seeded demo accounts (@sentrilearn.local) are counted in the totals below.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard label="Active Learners" value={data.totalLearners} icon={Users} color="brand" barPercent={100} />
        <StatsCard label="Training Completion" value={`${data.trainingCompletionPercent}%`} icon={GraduationCap} color="green" barPercent={data.trainingCompletionPercent} />
        <StatsCard label="Average Assessment Score" value={data.averageAssessmentScore != null ? `${data.averageAssessmentScore}%` : 'Not yet assessed'} unavailable={data.averageAssessmentScore == null} icon={Gauge} color="amber" barPercent={data.averageAssessmentScore ?? 0} />
        <StatsCard label="Practice Reporting Rate" value={data.averageReportingRate != null ? `${data.averageReportingRate}%` : 'Insufficient activity'} unavailable={data.averageReportingRate == null} icon={Flag} color="brand" barPercent={data.averageReportingRate ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3"><Gauge className="w-4 h-4 text-brand" /><h3 className="text-xs font-bold uppercase tracking-wider text-tx-muted">Reviewed-Practice Decision Accuracy</h3></div>
            <p className={data.averageDecisionAccuracy != null ? 'text-3xl font-extrabold text-tx-primary' : 'text-base font-semibold text-tx-muted'}>{data.averageDecisionAccuracy != null ? `${data.averageDecisionAccuracy}%` : 'Not yet assessed'}</p>
            <p className="text-xs text-tx-muted mt-1">average across learners with at least one reviewed-practice attempt</p>
          </div>

          <div className="card p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-tx-muted">Risk Distribution</h3>
            {data.riskDistribution.map((r) => (
              <div key={r.level}>
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5"><span className="text-tx-secondary capitalize">{r.level} Risk</span><span className="text-tx-primary">{r.percent}% ({r.count})</span></div>
                <ProgressBar percent={r.percent} color={RISK_BAR_COLOR[r.level]} />
              </div>
            ))}
            {data.unassessedCount > 0 && <p className="text-[11px] text-tx-muted pt-1">+{data.unassessedCount} learner(s) not yet assessed</p>}
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-tx-muted">Training Performance</h3>
          {data.trainingPerformance.map((t) => (
            <div key={t.module}>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5"><span className="text-tx-secondary">{t.module}</span><span className="text-tx-primary">{t.percent}%</span></div>
              <ProgressBar percent={t.percent} />
            </div>
          ))}
        </div>

        <div className="card p-5 space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-tx-muted mb-2">Recent Platform Activity</h3>
          {data.recentActivity.length === 0 ? <p className="text-xs text-tx-muted">No activity yet.</p> : data.recentActivity.map((a) => {
            const Icon = resolveActivityIcon(a.type);
            return (
              <div key={a.id} className="flex items-start gap-2.5 py-2 border-b border-surface-border last:border-0">
                <Icon className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-tx-primary leading-snug">{a.userName}: {a.message}</p>
                  <p className="text-[10px] text-tx-muted flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {data.campaignPerformance.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-tx-muted px-1">Campaign Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.campaignPerformance.map((c) => (
              <div key={c.id} className="card p-5">
                <p className="font-bold text-sm text-tx-primary">{c.name}</p>
                <p className="text-xs text-tx-muted mt-0.5 capitalize">{c.targetCategory} &middot; {c.status}</p>
                <div className="mt-3 space-y-1 text-xs text-tx-secondary">
                  <p>Assigned: <span className="font-semibold text-tx-primary">{c.assignedCount}</span></p>
                  <p>Completed: <span className="font-semibold text-tx-primary">{c.completedCount}</span></p>
                  <p>Detection rate: <span className="font-semibold text-tx-primary">{c.detectionRate != null ? `${c.detectionRate}%` : 'Not yet assessed'}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-tx-muted px-1">Learner Performance</h3>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-overlay/50">
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-tx-muted">Learner</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-tx-muted">Category</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-tx-muted">Awareness Score</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-tx-muted">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {data.learnerTable.map((l) => (
                <tr key={l.id} className="hover:bg-surface-overlay/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-tx-primary">{l.name}{l.isDemoAccount && <Badge variant="brand" className="ml-2 text-[9px]">Demo</Badge>}</td>
                  <td className="px-5 py-3 text-tx-secondary capitalize">{l.category}</td>
                  <td className="px-5 py-3 text-tx-secondary">{l.awarenessAvailable ? `${l.awarenessScore}/100` : 'Not yet assessed'}</td>
                  <td className="px-5 py-3"><RiskBadge level={l.riskLevel} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
