// =============================================
// LEARNER DASHBOARD
// =============================================
import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, ClipboardCheck, FlaskConical, TrendingUp,
  ShieldAlert, Clock, ChevronRight, ArrowRight,
} from 'lucide-react';
import { SectionHeader, ProgressBar, RiskBadge, EmptyState } from '../components/ui/index.jsx';
import { StatsCard } from '../components/dashboard/StatsCard.jsx';
import { TRAINING_MODULES } from '../data/trainingModules.js';
import { resolveIcon } from '../utils/iconMap.js';
import {
  seedDefaults, getModuleProgress, moduleStatus, getActivity, getAwarenessSnapshot,
} from '../utils/progressStore.js';

const STATUS_META = {
  completed: { label: 'Completed', color: 'text-emerald-600' },
  in_progress: { label: 'In Progress', color: 'text-amber-600' },
  not_started: { label: 'Not Started', color: 'text-tx-muted' },
};

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const [snapshot, setSnapshot] = useState(null);
  const [moduleProgress, setModuleProgress] = useState({});
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    seedDefaults();
    setSnapshot(getAwarenessSnapshot());
    setModuleProgress(getModuleProgress());
    setActivity(getActivity().slice(0, 3));
  }, []);

  const nextModule = useMemo(() => {
    return TRAINING_MODULES.find((m) => {
      const percent = moduleProgress[m.id]?.percent ?? 0;
      return percent > 0 && percent < 100;
    }) || TRAINING_MODULES.find((m) => (moduleProgress[m.id]?.percent ?? 0) === 0);
  }, [moduleProgress]);

  if (!snapshot) return null;

  return (
    <div className="page-wrapper">
      <SectionHeader
        title="Cybersecurity Awareness Dashboard"
        subtitle="Track your training progress and strengthen your digital safety skills."
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard label="Training Progress" value={`${snapshot.trainingCompletion}%`} icon={GraduationCap} color="brand" barPercent={snapshot.trainingCompletion} />
        <StatsCard label="Quiz Average" value={`${snapshot.assessmentAvg}%`} icon={ClipboardCheck} color="green" barPercent={snapshot.assessmentAvg} />
        <StatsCard label="Phishing Detection" value={`${snapshot.phishingDetection}%`} icon={FlaskConical} color="amber" barPercent={snapshot.phishingDetection} />
        <div className="card p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-tx-muted mb-3">Risk Level</p>
          <RiskBadge level={snapshot.risk.level} className="text-sm px-3 py-1" />
          <p className="text-xs text-tx-muted mt-3">Awareness score: <span className="font-semibold text-tx-primary">{snapshot.score}/100</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Learning journey */}
        <div className="xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-tx-muted">Your Learning Journey</h3>
            <Link to="/training" className="text-[11px] font-bold text-brand hover:text-brand-dim flex items-center gap-1">
              VIEW ALL <ChevronRight size={12} />
            </Link>
          </div>

          <div className="card divide-y divide-surface-border overflow-hidden">
            {TRAINING_MODULES.map((mod) => {
              const percent = moduleProgress[mod.id]?.percent ?? 0;
              const status = moduleStatus(percent);
              const Icon = resolveIcon(mod.icon);
              return (
                <Link
                  key={mod.id}
                  to={`/training/${mod.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-surface-overlay/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-surface-overlay border border-surface-border flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-tx-primary truncate">{mod.title}</p>
                      <span className={`text-[11px] font-bold shrink-0 ${STATUS_META[status].color}`}>
                        {status === 'in_progress' ? `${percent}%` : STATUS_META[status].label}
                      </span>
                    </div>
                    <ProgressBar percent={percent} className="mt-2" height="h-1.5" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Recommended next step */}
          {nextModule && (
            <div className="bg-brand/5 border border-brand/15 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
                <ArrowRight className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-brand uppercase tracking-widest">Recommended Next Step</p>
                <p className="text-sm text-tx-primary font-semibold mt-0.5">
                  Continue {nextModule.title} Training
                </p>
              </div>
              <Link to={`/training/${nextModule.id}`} className="btn-primary shrink-0">
                Continue
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar: activity + quick actions */}
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
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-raised border border-surface-border hover:border-brand/40 hover:bg-brand/5 transition-all group"
                >
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
            {activity.length === 0 ? (
              <EmptyState icon={Clock} title="No activity yet" description="Complete a lesson or quiz to see your activity here." />
            ) : (
              <div className="card divide-y divide-surface-border overflow-hidden">
                {activity.map((a) => {
                  const Icon = resolveIcon(a.icon);
                  return (
                    <div key={a.id} className="flex items-start gap-3 p-3.5">
                      <div className="w-7 h-7 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-tx-primary leading-snug">{a.text}</p>
                        <p className="text-[10px] text-tx-muted mt-0.5">{timeAgo(a.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compliance banner */}
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
