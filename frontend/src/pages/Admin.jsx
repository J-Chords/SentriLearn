// =============================================
// ADMIN ANALYTICS DASHBOARD
// =============================================
import { useEffect, useState } from 'react';
import {
  Users, GraduationCap, Gauge, Flag, MousePointerClick, Clock,
} from 'lucide-react';
import { SectionHeader, ProgressBar, RiskBadge } from '../components/ui/index.jsx';
import { StatsCard } from '../components/dashboard/StatsCard.jsx';
import {
  ORG_OVERVIEW, RISK_DISTRIBUTION, TRAINING_PERFORMANCE, LEARNER_PERFORMANCE,
} from '../data/adminAnalytics.js';
import { DEFAULT_CAMPAIGNS } from '../data/campaigns.js';
import { STORAGE_KEYS, ensureSeeded } from '../utils/storage.js';
import { getActivity, seedDefaults } from '../utils/progressStore.js';
import { resolveIcon } from '../utils/iconMap.js';

const RISK_BAR_COLOR = { low: 'green', medium: 'amber', high: 'red' };

export default function Admin() {
  const [campaigns, setCampaigns] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    seedDefaults();
    setCampaigns(ensureSeeded(STORAGE_KEYS.CAMPAIGNS, DEFAULT_CAMPAIGNS) || DEFAULT_CAMPAIGNS);
    setActivity(getActivity().slice(0, 5));
  }, []);

  return (
    <div className="page-wrapper">
      <SectionHeader
        title="SentriLearn Administrator Analytics"
        subtitle="Organization-wide training performance and phishing awareness metrics."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard label="Total Learners" value={ORG_OVERVIEW.totalLearners} icon={Users} color="brand" barPercent={100} />
        <StatsCard label="Training Completion" value={`${ORG_OVERVIEW.trainingCompletion}%`} icon={GraduationCap} color="green" barPercent={ORG_OVERVIEW.trainingCompletion} />
        <StatsCard label="Average Awareness Score" value={`${ORG_OVERVIEW.averageAwarenessScore}%`} icon={Gauge} color="amber" barPercent={ORG_OVERVIEW.averageAwarenessScore} />
        <StatsCard label="Phishing Report Rate" value={`${ORG_OVERVIEW.phishingReportRate}%`} icon={Flag} color="brand" barPercent={ORG_OVERVIEW.phishingReportRate} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Click/miss rate + risk distribution */}
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <MousePointerClick className="w-4 h-4 text-severity-critical" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-tx-muted">Phishing Click Rate</h3>
            </div>
            <p className="text-3xl font-extrabold text-tx-primary">{ORG_OVERVIEW.phishingClickRate}%</p>
            <p className="text-xs text-tx-muted mt-1">of simulated campaign recipients clicked before reporting</p>
          </div>

          <div className="card p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-tx-muted">Risk Distribution</h3>
            {RISK_DISTRIBUTION.map((r) => (
              <div key={r.level}>
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-tx-secondary">{r.label}</span>
                  <span className="text-tx-primary">{r.percent}%</span>
                </div>
                <ProgressBar percent={r.percent} color={RISK_BAR_COLOR[r.level]} />
              </div>
            ))}
          </div>
        </div>

        {/* Training performance */}
        <div className="card p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-tx-muted">Training Performance</h3>
          {TRAINING_PERFORMANCE.map((t) => (
            <div key={t.module}>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-tx-secondary">{t.module}</span>
                <span className="text-tx-primary">{t.percent}%</span>
              </div>
              <ProgressBar percent={t.percent} />
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div className="card p-5 space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-tx-muted mb-2">Recent Platform Activity</h3>
          {activity.map((a) => {
            const Icon = resolveIcon(a.icon);
            return (
              <div key={a.id} className="flex items-start gap-2.5 py-2 border-b border-surface-border last:border-0">
                <Icon className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-tx-primary leading-snug">{a.text}</p>
                  <p className="text-[10px] text-tx-muted flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />{new Date(a.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campaign performance */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-tx-muted px-1">Campaign Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {campaigns.map((c) => (
            <div key={c.id} className="card p-5">
              <p className="font-bold text-sm text-tx-primary">{c.name}</p>
              <p className="text-xs text-tx-muted mt-0.5">{c.target} &middot; {c.status}</p>
              <div className="mt-3 space-y-2.5">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold mb-1"><span className="text-tx-secondary">Detection</span><span className="text-tx-primary">{c.detectionRate}%</span></div>
                  <ProgressBar percent={c.detectionRate} color="green" height="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-semibold mb-1"><span className="text-tx-secondary">Reported</span><span className="text-tx-primary">{c.reportRate}%</span></div>
                  <ProgressBar percent={c.reportRate} color="brand" height="h-1.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learner performance table */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-tx-muted px-1">Learner Performance</h3>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-overlay/50">
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-tx-muted">Learner</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-tx-muted">Group</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-tx-muted">Awareness Score</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-tx-muted">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {LEARNER_PERFORMANCE.map((l) => (
                <tr key={l.name} className="hover:bg-surface-overlay/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-tx-primary">{l.name}</td>
                  <td className="px-5 py-3 text-tx-secondary">{l.group}</td>
                  <td className="px-5 py-3 text-tx-secondary">{l.score}/100</td>
                  <td className="px-5 py-3"><RiskBadge level={l.risk} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
