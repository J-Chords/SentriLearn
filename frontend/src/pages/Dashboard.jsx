// =============================================
// LEARNER DASHBOARD
// =============================================
import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, ClipboardCheck, FlaskConical, TrendingUp,
  ShieldAlert, Clock, ChevronRight, ArrowRight, Loader, Info,
} from 'lucide-react';
import { SectionHeader, ProgressBar, RiskBadge, EmptyState } from '../components/ui/index.jsx';
import { StatsCard } from '../components/dashboard/StatsCard.jsx';
import { resolveIcon, resolveActivityIcon } from '../utils/iconMap.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { useAuth } from '../context/AuthContext.jsx';

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const STATUS_META = {
  completed: { label: 'Completed', color: 'text-emerald-600' },
  in_progress: { label: 'In Progress', color: 'text-amber-600' },
  not_started: { label: 'Not Started', color: 'text-tx-muted' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AnalyticsService.getMine().then((res) => setSnapshot(res.data)).finally(() => setLoading(false));
  }, []);

  const nextModule = useMemo(() => {
    if (!snapshot) return null;
    const modules = snapshot.training.perModule;
    return modules.find((m) => m.percent > 0 && m.percent < 100) || modules.find((m) => m.percent === 0) || null;
  }, [snapshot]);

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader className="w-6 h-6 text-brand animate-spin" /></div>;
  }
  if (!snapshot) return null;

  const { training, assessment, decisionAccuracy, awareness, recentActivity } = snapshot;

  return (
    <div className="page-wrapper">
      <SectionHeader
        title="Cybersecurity Awareness Dashboard"
        subtitle="Track your training progress and strengthen your digital safety skills."
      />

      {user?.isDemoAccount && (
        <div className="card p-3 flex items-center gap-2.5 bg-brand/[0.05] border-brand/20">
          <Info className="w-4 h-4 text-brand shrink-0" />
          <p className="text-xs text-tx-secondary"><strong className="text-tx-primary">This is a demo account.</strong> Activity shown here is seeded/demo data, not a real participant's record.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard label="Training Progress" value={`${training.trainingCompletionPercent}%`} icon={GraduationCap} color="brand" barPercent={training.trainingCompletionPercent} />
        <StatsCard label="Quiz Average" value={assessment.available ? `${assessment.average}%` : 'Not yet assessed'} unavailable={!assessment.available} icon={ClipboardCheck} color="green" barPercent={assessment.average ?? 0} />
        <StatsCard label="Phishing Detection" value={decisionAccuracy.available ? `${decisionAccuracy.accuracy}%` : 'Not yet assessed'} unavailable={!decisionAccuracy.available} icon={FlaskConical} color="amber" barPercent={decisionAccuracy.accuracy ?? 0} />
        <div className="card p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-tx-muted mb-3">Risk Level</p>
          <RiskBadge level={awareness.riskLevel} label={awareness.riskLabel} className="text-sm px-3 py-1" />
          <p className="text-xs text-tx-muted mt-3">
            {awareness.available ? <>Awareness score: <span className="font-semibold text-tx-primary">{awareness.score}/100</span></> : 'Complete a lesson, assessment or practice scenario to get scored.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-tx-muted">Your Learning Journey</h3>
            <Link to="/training" className="text-[11px] font-bold text-brand hover:text-brand-dim flex items-center gap-1">
              VIEW ALL <ChevronRight size={12} />
            </Link>
          </div>

          <div className="card divide-y divide-surface-border overflow-hidden">
            {training.perModule.map((mod) => {
              const Icon = resolveIcon(mod.icon);
              return (
                <Link key={mod.id} to={`/training/${mod.id}`} className="flex items-center gap-4 p-4 hover:bg-surface-overlay/40 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-surface-overlay border border-surface-border flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-tx-primary truncate">{mod.title}</p>
                      <span className={`text-[11px] font-bold shrink-0 ${STATUS_META[mod.status].color}`}>
                        {mod.status === 'in_progress' ? `${mod.percent}%` : STATUS_META[mod.status].label}
                      </span>
                    </div>
                    <ProgressBar percent={mod.percent} className="mt-2" height="h-1.5" />
                  </div>
                </Link>
              );
            })}
          </div>

          {nextModule && (
            <div className="bg-brand/5 border border-brand/15 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
                <ArrowRight className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-brand uppercase tracking-widest">Recommended Next Step</p>
                <p className="text-sm text-tx-primary font-semibold mt-0.5">Continue {nextModule.title} Training</p>
              </div>
              <Link to={`/training/${nextModule.id}`} className="btn-primary shrink-0">Continue</Link>
            </div>
          )}
        </div>

        <div className="xl:col-span-4 space-y-8">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-tx-muted px-1">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { to: '/training', icon: GraduationCap, label: 'Continue Training' },
                { to: '/assessments', icon: ClipboardCheck, label: 'Take Assessment' },
                { to: '/simulation', icon: FlaskConical, label: 'Start Phishing Simulation' },
                { to: '/progress', icon: TrendingUp, label: 'View My Progress' },
              ].map((item) => (
                <Link key={item.to} to={item.to} className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-raised border border-surface-border hover:border-brand/40 hover:bg-brand/5 transition-all group">
                  <div className="w-9 h-9 rounded-lg bg-surface-overlay border border-surface-border flex items-center justify-center group-hover:bg-brand/10 transition-colors">
                    <item.icon className="w-4 h-4 text-tx-muted group-hover:text-brand" />
                  </div>
                  <p className="text-sm font-semibold text-tx-primary group-hover:text-brand">{item.label}</p>
                  <ChevronRight className="ml-auto w-4 h-4 text-tx-muted group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-tx-muted px-1">Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <EmptyState icon={Clock} title="No activity yet" description="Complete a lesson or quiz to see your activity here." />
            ) : (
              <div className="card divide-y divide-surface-border overflow-hidden">
                {recentActivity.map((a) => {
                  const Icon = resolveActivityIcon(a.type);
                  return (
                    <div key={a.id} className="flex items-start gap-3 p-3.5">
                      <div className="w-7 h-7 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-tx-primary leading-snug">{a.message}</p>
                        <p className="text-[10px] text-tx-muted mt-0.5">{timeAgo(a.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-brand/5 border border-brand/10 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
          <ShieldAlert size={22} />
        </div>
        <div className="text-center md:text-left">
          <p className="text-xs font-bold text-brand uppercase tracking-widest">Educational Platform</p>
          <p className="text-[11px] text-tx-secondary leading-relaxed font-medium mt-1">
            SentriLearn is a controlled cybersecurity awareness training environment. All simulated phishing content is fictional and used strictly for educational defense training.
          </p>
        </div>
      </div>
    </div>
  );
}
