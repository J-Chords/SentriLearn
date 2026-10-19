// =============================================
// ASSESSMENT RUNNER — QUIZ ENGINE + RESULTS + REVIEW
//
// Grading happens entirely on the server. The question payload
// received here never includes correct answers or explanations —
// those only arrive in the submit response, and only for the
// question the learner already answered.
// =============================================
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  Award, TrendingUp, TrendingDown, RotateCcw, Loader,
} from 'lucide-react';
import { AssessmentService } from '../services/assessments.service.js';
import { awarenessLevelLabel } from '../utils/riskScore.js';
import { EmptyState, ProgressBar, Badge } from '../components/ui/index.jsx';

export default function AssessmentRunner() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('loading'); // loading | quiz | results | review | error
  const [assessment, setAssessment] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const startFresh = () => {
    setPhase('loading');
    setAnswers({});
    setIndex(0);
    setResult(null);
    AssessmentService.startAttempt(assessmentId)
      .then((res) => {
        setAssessment(res.data.assessment);
        setAttemptId(res.data.attemptId);
        setPhase('quiz');
      })
      .catch(() => setPhase('error'));
  };

  useEffect(startFresh, [assessmentId]);

  if (phase === 'loading') return <div className="flex items-center justify-center py-24"><Loader className="w-6 h-6 text-brand animate-spin" /></div>;

  if (phase === 'error' || !assessment) {
    return (
      <EmptyState
        icon={ChevronLeft}
        title="Assessment not found"
        description="This assessment does not exist."
        action={<Link to="/assessments" className="btn-primary">Back to Assessments</Link>}
      />
    );
  }

  const question = assessment.questions[index];
  const isLast = index === assessment.questions.length - 1;
  const hasAnswered = answers[question.id] !== undefined;

  const selectOption = (optionId) => setAnswers((prev) => ({ ...prev, [question.id]: optionId }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = assessment.questions.map((q) => ({ questionId: q.id, selectedOptionId: answers[q.id] }));
      const res = await AssessmentService.submitAttempt(attemptId, payload);
      setResult(res.data);
      setPhase('results');
    } catch (err) {
      toast.error(err.message || 'Could not submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- QUIZ PHASE ---------------- */
  if (phase === 'quiz') {
    return (
      <div className="page-wrapper max-w-2xl mx-auto">
        <div>
          <h1 className="section-title">{assessment.title}</h1>
          <p className="text-tx-secondary text-sm mt-1">Question {index + 1} of {assessment.questions.length}</p>
        </div>

        <ProgressBar percent={((index + 1) / assessment.questions.length) * 100} />

        <div className="card p-6 space-y-5 animate-fade-in">
          <p className="text-base font-semibold text-tx-primary leading-relaxed">{question.text}</p>

          <div className="space-y-2.5">
            {question.options.map((opt) => {
              const selected = answers[question.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => selectOption(opt.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    selected ? 'border-brand bg-brand/[0.08] text-tx-primary' : 'border-surface-border bg-surface-overlay/30 text-tx-secondary hover:border-brand/30 hover:bg-surface-overlay'
                  }`}
                >
                  <span className="inline-flex items-center gap-3">
                    <span className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${selected ? 'border-brand bg-brand' : 'border-surface-border'}`}>
                      {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className="btn-secondary disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {isLast ? (
            <button onClick={handleSubmit} disabled={!hasAnswered || submitting} className="btn-primary disabled:opacity-40">
              {submitting ? <Loader className="w-4 h-4 animate-spin" /> : 'Submit Assessment'}
            </button>
          ) : (
            <button onClick={() => setIndex((i) => i + 1)} disabled={!hasAnswered} className="btn-primary disabled:opacity-40">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ---------------- RESULTS PHASE ---------------- */
  if (phase === 'results' && result) {
    return (
      <div className="page-wrapper max-w-2xl mx-auto text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
            <Award className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-tx-primary tracking-tight">Assessment Complete</h1>
          <p className="text-tx-secondary text-sm">{assessment.title}</p>
        </div>

        <div className="card p-8 space-y-2">
          <p className="text-4xl font-extrabold text-tx-primary">{result.score} / {result.total}</p>
          <p className="text-lg font-bold text-brand">{result.percentage}%</p>
          <Badge variant={result.percentage >= 70 ? 'low' : result.percentage >= 40 ? 'medium' : 'critical'} className="mt-2">
            Awareness Level: {awarenessLevelLabel(result.percentage)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div className="card p-5">
            <p className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">
              <TrendingUp className="w-4 h-4" /> Strengths
            </p>
            {result.strengths.length === 0 ? (
              <p className="text-xs text-tx-muted">No consistent strengths identified yet — keep practicing.</p>
            ) : (
              <ul className="space-y-1.5">
                {result.strengths.map((s) => (
                  <li key={s} className="text-xs text-tx-secondary flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />{s}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card p-5">
            <p className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">
              <TrendingDown className="w-4 h-4" /> Areas to Improve
            </p>
            {result.areasToImprove.length === 0 ? (
              <p className="text-xs text-tx-muted">Great work — no weak areas detected.</p>
            ) : (
              <ul className="space-y-1.5">
                {result.areasToImprove.map((s) => (
                  <li key={s} className="text-xs text-tx-secondary flex items-start gap-2">
                    <XCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />{s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button onClick={() => setPhase('review')} className="btn-secondary justify-center">Review Answers</button>
          <button onClick={startFresh} className="btn-secondary justify-center"><RotateCcw className="w-4 h-4" /> Retake</button>
          <button onClick={() => navigate('/dashboard')} className="btn-primary justify-center">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  /* ---------------- REVIEW PHASE ---------------- */
  return (
    <div className="page-wrapper max-w-2xl mx-auto">
      <div>
        <h1 className="section-title">Review Answers</h1>
        <p className="text-tx-secondary text-sm mt-1">{assessment.title}</p>
      </div>

      <div className="space-y-4">
        {result.review.map((r, i) => (
          <div key={r.questionId} className="card p-5 space-y-3">
            <div className="flex items-start gap-2.5">
              {r.isCorrect ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="w-4.5 h-4.5 text-severity-critical shrink-0 mt-0.5" />}
              <p className="text-sm font-semibold text-tx-primary leading-relaxed">{i + 1}. {r.question}</p>
            </div>

            <div className="pl-7 space-y-1.5">
              {r.options.map((opt) => {
                const isUser = opt.id === r.selectedOptionId;
                return (
                  <div
                    key={opt.id}
                    className={`text-xs px-3 py-2 rounded-lg border ${
                      opt.isCorrect
                        ? 'border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-400 font-medium'
                        : isUser
                        ? 'border-severity-critical/30 bg-severity-critical/[0.08] text-severity-critical font-medium'
                        : 'border-surface-border text-tx-muted'
                    }`}
                  >
                    {opt.text} {opt.isCorrect && '✓'} {isUser && !opt.isCorrect && '✗'}
                  </div>
                );
              })}
            </div>

            <div className="pl-7">
              <p className="text-xs text-tx-secondary leading-relaxed bg-surface-overlay/50 p-3 rounded-lg border border-surface-border">
                <span className="font-semibold text-tx-primary">Explanation: </span>{r.explanation}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-3">
        <button onClick={() => setPhase('results')} className="btn-secondary">Back to Results</button>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">Return to Dashboard</button>
      </div>
    </div>
  );
}
