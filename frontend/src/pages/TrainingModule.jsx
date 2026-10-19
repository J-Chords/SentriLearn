// =============================================
// TRAINING MODULE — LESSON VIEWER
// =============================================
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, ArrowLeft, Loader } from 'lucide-react';
import { resolveIcon } from '../utils/iconMap.js';
import { TrainingService } from '../services/training.service.js';
import { EmptyState, ProgressBar } from '../components/ui/index.jsx';

export default function TrainingModule() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [mod, setMod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const load = () => TrainingService.getModules().then((res) => {
    const found = res.data.modules.find((m) => m.id === moduleId);
    setMod(found || null);
  }).finally(() => setLoading(false));

  useEffect(() => { load(); }, [moduleId]);

  if (loading) return <div className="flex items-center justify-center py-24"><Loader className="w-6 h-6 text-brand animate-spin" /></div>;

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
  const isDone = lesson.completed;
  const isLast = lessonIndex === mod.lessons.length - 1;
  const isFirst = lessonIndex === 0;

  const handleMarkComplete = async () => {
    if (isDone || saving) return;
    setSaving(true);
    try {
      await TrainingService.completeLesson(lesson.id);
      toast.success('Lesson marked as complete');
      await load();
    } catch (err) {
      toast.error(err.message || 'Could not save progress.');
    } finally {
      setSaving(false);
    }
  };

  const goNext = () => {
    if (isLast) {
      if (mod.percent >= 100) {
        toast.success('Module complete! Great work.');
      } else {
        toast('You can return anytime to finish the remaining lessons.', { icon: '👋' });
      }
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

      <ProgressBar percent={mod.percent} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="card p-2 space-y-1">
            {mod.lessons.map((l, i) => (
              <button
                key={l.id}
                onClick={() => setLessonIndex(i)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs font-medium transition-colors ${
                  i === lessonIndex ? 'bg-brand/10 text-brand border border-brand/20' : 'text-tx-secondary hover:bg-surface-overlay'
                }`}
              >
                {l.completed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-tx-muted shrink-0" />}
                <span className="truncate">{l.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 order-1 lg:order-2 space-y-5">
          <div className="card p-6 space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-tx-primary tracking-tight">{lesson.title}</h2>
            <div className="space-y-3">
              {lesson.body.map((p, i) => <p key={i} className="text-sm text-tx-secondary leading-relaxed">{p}</p>)}
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
            <button onClick={() => setLessonIndex((i) => Math.max(0, i - 1))} disabled={isFirst} className="btn-secondary disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <button onClick={handleMarkComplete} disabled={isDone || saving} className={isDone ? 'btn-secondary' : 'btn-primary'}>
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {isDone ? 'Completed' : saving ? 'Saving…' : 'Mark as Complete'}
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
