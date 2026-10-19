// =============================================
// TRAINING MODULES — OVERVIEW GRID
// =============================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpenCheck, ChevronRight, Loader } from 'lucide-react';
import { SectionHeader, ProgressBar, Badge } from '../components/ui/index.jsx';
import { resolveIcon } from '../utils/iconMap.js';
import { TrainingService } from '../services/training.service.js';

const STATUS_LABEL = {
  completed: { text: 'Review Module', badge: 'Completed', variant: 'low' },
  in_progress: { text: 'Continue', badge: 'In Progress', variant: 'medium' },
  not_started: { text: 'Start', badge: 'Not Started', variant: 'ghost' },
};

export default function Training() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    TrainingService.getModules().then((res) => setModules(res.data.modules)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-24"><Loader className="w-6 h-6 text-brand animate-spin" /></div>;

  return (
    <div className="page-wrapper">
      <SectionHeader
        title="Cybersecurity Awareness Training"
        subtitle="Build practical skills to recognise and respond to common cyber threats."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {modules.map((mod) => {
          const meta = STATUS_LABEL[mod.status];
          const Icon = resolveIcon(mod.icon);

          return (
            <div key={mod.id} className="card p-6 flex flex-col">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-tx-primary">{mod.title}</h3>
                    <Badge variant={meta.variant} className="shrink-0">{meta.badge}</Badge>
                  </div>
                  <p className="text-sm text-tx-secondary mt-1.5 leading-relaxed">{mod.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 text-xs text-tx-muted font-medium">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{mod.durationLabel}</span>
                <span className="flex items-center gap-1.5"><BookOpenCheck className="w-3.5 h-3.5" />{mod.lessons.length} lessons</span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] font-semibold text-tx-muted mb-1.5">
                  <span>Progress</span>
                  <span className="text-tx-primary">{mod.percent}%</span>
                </div>
                <ProgressBar percent={mod.percent} color={mod.status === 'completed' ? 'green' : 'brand'} />
              </div>

              <Link to={`/training/${mod.id}`} className="btn-primary w-full justify-center mt-5">
                {meta.text}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
