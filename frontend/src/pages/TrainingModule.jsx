// =============================================
// TRAINING MODULE — LESSON VIEWER
// =============================================
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, ArrowLeft } from 'lucide-react';
import { getModuleById } from '../data/trainingModules.js';
import { resolveIcon } from '../utils/iconMap.js';
import { getModuleProgressFor, toggleLessonComplete } from '../utils/progressStore.js';
import { EmptyState, ProgressBar } from '../components/ui/index.jsx';

export default function TrainingModule() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const mod = getModuleById(moduleId);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [progress, setProgress] = useState({ percent: 0, completedLessonIds: [] });

  useEffect(() => {
    if (mod) setProgress(getModuleProgressFor(mod.id));
  }, [mod?.id]);

  if (!mod) {
    return (
      <EmptyState
        icon={ArrowLeft}
        title="Module not found"
        description="This training module does not exist."
        action={<Link to="/training" className="btn-primary">Back to Training</Link>}
      />
    );
  }

  const lesson = mod.lessons[lessonIndex];
  const Icon = resolveIcon(mod.icon);
  const isDone = progress.completedLessonIds.includes(lesson.id);
  const isLast = lessonIndex === mod.lessons.length - 1;
  const isFirst = lessonIndex === 0;

  const handleToggleComplete = () => {
    const updated = toggleLessonComplete(mod.id, lesson.id);
    setProgress(updated);
    if (!isDone) toast.success('Lesson marked as complete');
  };

  const goNext = () => {
    if (isLast) {
      toast.success('Module complete! Great work.');
      navigate('/training');
    } else {
      setLessonIndex((i) => i + 1);
    }
  };

  return (
    <div className="page-wrapper">
      <Link to="/training" className="inline-flex items-center gap-1.5 text-xs font-semibold text-tx-secondary hover:text-brand transition-colors">
        <ChevronLeft className="w-3.5 h-3.5" /> Back to Training Modules
      </Link>

      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-brand" />
        </div>
        <div>
          <h1 className="section-title">{mod.title}</h1>
          <p className="text-tx-secondary text-sm mt-1">{mod.description}</p>
        </div>
      </div>

      <ProgressBar percent={progress.percent} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lesson navigator */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="card p-2 space-y-1">
            {mod.lessons.map((l, i) => {
              const done = progress.completedLessonIds.includes(l.id);
              return (
                <button
                  key={l.id}
                  onClick={() => setLessonIndex(i)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs font-medium transition-colors ${
                    i === lessonIndex ? 'bg-brand/10 text-brand border border-brand/20' : 'text-tx-secondary hover:bg-surface-overlay'
                  }`}
                >
                  {done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-tx-muted shrink-0" />}
                  <span className="truncate">{l.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lesson content */}
        <div className="lg:col-span-3 order-1 lg:order-2 space-y-5">
          <div className="card p-6 space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-tx-primary tracking-tight">{lesson.title}</h2>
            <div className="space-y-3">
              {lesson.body.map((p, i) => (
                <p key={i} className="text-sm text-tx-secondary leading-relaxed">{p}</p>
              ))}
            </div>

            {lesson.keyTakeaways?.length > 0 && (
              <div className="p-4 rounded-xl bg-surface-overlay border border-surface-border">
                <p className="text-xs font-bold text-tx-primary uppercase tracking-wider mb-2">Key Takeaways</p>
                <ul className="space-y-1.5">
                  {lesson.keyTakeaways.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-tx-secondary leading-relaxed">
                      <span className="text-brand font-bold shrink-0 mt-0.5">›</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button
              onClick={() => setLessonIndex((i) => Math.max(0, i - 1))}
              disabled={isFirst}
              className="btn-secondary disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <button onClick={handleToggleComplete} className={isDone ? 'btn-secondary' : 'btn-primary'}>
              <CheckCircle2 className="w-4 h-4" />
              {isDone ? 'Marked Complete' : 'Mark as Complete'}
            </button>

            <button onClick={goNext} className="btn-primary">
              {isLast ? 'Finish Module' : 'Next Lesson'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
