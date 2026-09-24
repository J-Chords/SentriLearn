// =============================================
// MY CYBERSECURITY PROGRESS
// =============================================
import { useEffect, useState } from 'react';
import {
  UserCircle2, GraduationCap, ClipboardCheck, FlaskConical, Flag,
  Award, Mail, KeyRound, ShieldCheck, Sparkles,
} from 'lucide-react';
import { SectionHeader, ProgressBar, RiskBadge } from '../components/ui/index.jsx';
import { TRAINING_MODULES } from '../data/trainingModules.js';
import { seedDefaults, getModuleProgress, getAwarenessSnapshot } from '../utils/progressStore.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Progress() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState(null);
  const [moduleProgress, setModuleProgress] = useState({});

  useEffect(() => {
    seedDefaults();
    setSnapshot(getAwarenessSnapshot());
    setModuleProgress(getModuleProgress());
  }, []);

  if (!snapshot) return null;

  const achievements = [
    {
      id: 'security-starter',
      label: 'Security Starter',
      icon: ShieldCheck,
      earned: snapshot.modulesCompleted >= 1,
    },
    {
      id: 'phishing-spotter',
      label: 'Phishing Spotter',
      icon: Mail,
      earned: (moduleProgress['phishing-awareness']?.percent ?? 0) >= 100 || snapshot.phishingDetection >= 75,
    },
    {
      id: 'password-protector',
      label: 'Password Protector',
      icon: KeyRound,
      earned: (moduleProgress['password-security']?.percent ?? 0) >= 70,
    },
    {
      id: 'awareness-champion',
      label: 'Awareness Champion',
      icon: Award,
      earned: snapshot.risk.level === 'low',
    },
  ];

  return (
    <div className="page-wrapper">
      <SectionHeader title="My Cybersecurity Progress" subtitle="A full picture of your training, assessments and simulation performance." />

      {/* Profile */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
          <UserCircle2 className="w-7 h-7" />
        </div>
        <div>
          <p className="font-bold text-tx-primary">{user?.name || 'Demo Learner'}</p>
          <p className="text-xs text-tx-muted">{user?.title || 'Student / Employee'}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-extrabold text-tx-primary">{snapshot.score}<span className="text-sm text-tx-muted"> / 100</span></p>
          <RiskBadge level={snapshot.risk.level} className="mt-1" />
        </div>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Training Completed', value: `${snapshot.modulesCompleted} / ${snapshot.totalModules}`, sub: 'Modules', icon: GraduationCap },
          { label: 'Quiz Average', value: `${snapshot.assessmentAvg}%`, icon: ClipboardCheck },
          { label: 'Phishing Detection', value: `${snapshot.phishingDetection}%`, icon: FlaskConical },
          { label: 'Reporting Behaviour', value: `${snapshot.reportingBehaviour}%`, icon: Flag },
        ].map((m) => (
          <div key={m.label} className="card p-5">
            <div className="w-9 h-9 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-3">
              <m.icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-2xl font-extrabold text-tx-primary">{m.value}</p>
            <p className="text-[11px] text-tx-muted font-semibold uppercase tracking-wide mt-1">{m.label}{m.sub ? ` ${m.sub}` : ''}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress history */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-tx-muted px-1">Progress History</h3>
          <div className="card p-5 space-y-4">
            {TRAINING_MODULES.map((mod) => {
              const percent = moduleProgress[mod.id]?.percent ?? 0;
              return (
                <div key={mod.id}>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-tx-secondary">{mod.title}</span>
                    <span className="text-tx-primary">{percent}%</span>
                  </div>
                  <ProgressBar percent={percent} color={percent >= 100 ? 'green' : 'brand'} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-tx-muted px-1">Recent Achievements</h3>
          <div className="card p-5 grid grid-cols-2 gap-3">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                  a.earned ? 'border-brand/30 bg-brand/[0.06]' : 'border-surface-border bg-surface-overlay/40 opacity-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${a.earned ? 'bg-brand/15 text-brand' : 'bg-surface-overlay text-tx-muted'}`}>
                  <a.icon className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-tx-primary">{a.label}</p>
                {a.earned && <Sparkles className="w-3 h-3 text-amber-500" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
