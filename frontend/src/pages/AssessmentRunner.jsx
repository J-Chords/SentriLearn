// =============================================
// ASSESSMENT RUNNER — QUIZ ENGINE + RESULTS + REVIEW
// =============================================
import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  Award, TrendingUp, TrendingDown, RotateCcw,
} from 'lucide-react';
import { getAssessmentById } from '../data/assessments.js';
import { saveAssessmentResult } from '../utils/progressStore.js';
import { awarenessLevelLabel } from '../utils/riskScore.js';
import { EmptyState, ProgressBar, Badge } from '../components/ui/index.jsx';

export default function AssessmentRunner() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const assessment = getAssessmentById(assessmentId);

  const [phase, setPhase] = useState('quiz'); // quiz | results | review
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const graded = useMemo(() => {
    if (!assessment) return null;
    let correct = 0;
    const strengthSkills = new Set();
    const improveSkills = new Set();

    assessment.questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) {
        correct += 1;
        strengthSkills.add(q.skill);
      } else {
        improveSkills.add(q.skill);
      }
    });
    // A skill only counts as a strength if it never appeared in the "improve" set.
    const strengths = [...strengthSkills].filter((s) => !improveSkills.has(s));
    const areasToImprove = [...improveSkills];
    const total = assessment.questions.length;
    const percentage = Math.round((correct / total) * 100);
    return { correct, total, percentage, strengths, areasToImprove };
  }, [assessment, answers]);

  if (!assessment) {
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

  const selectOption = (optionIndex) => {
    setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }));
  };

  const handleSubmit = () => {
    const saved = {
      score: graded.correct,
      total: graded.total,
      percentage: graded.percentage,
      answers,
      completedAt: new Date().toISOString(),
    };
    saveAssessmentResult(assessment.id, saved);
    setResult({ ...graded });
    setPhase('results');
  };

  const retake = () => {
    setAnswers({});
    setIndex(0);
    setResult(null);
    setPhase('quiz');
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
          <p className="text-base font-semibold text-tx-primary leading-relaxed">{question.question}</p>

          <div className="space-y-2.5">
            {question.options.map((opt, i) => {
              const selected = answers[question.id] === i;
              return (
                <button
                  key={i}
                  onClick={() => selectOption(i)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    selected
                      ? 'border-brand bg-brand/[0.08] text-tx-primary'
                      : 'border-surface-border bg-surface-overlay/30 text-tx-secondary hover:border-brand/30 hover:bg-surface-overlay'
                  }`}
                >
                  <span className="inline-flex items-center gap-3">
                    <span className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${selected ? 'border-brand bg-brand' : 'border-surface-border'}`}>
                      {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    {opt}
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
            <button onClick={handleSubmit} disabled={!hasAnswered} className="btn-primary disabled:opacity-40">
              Submit Assessment
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
          <p className="text-4xl font-extrabold text-tx-primary">{result.correct} / {result.total}</p>
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
          <button onClick={() => setPhase('review')} className="btn-secondary justify-center">
            Review Answers
          </button>
          <button onClick={retake} className="btn-secondary justify-center">
            <RotateCcw className="w-4 h-4" /> Retake
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-primary justify-center">
            Return to Dashboard
          </button>
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
        {assessment.questions.map((q, i) => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.correctIndex;
          return (
            <div key={q.id} className="card p-5 space-y-3">
              <div className="flex items-start gap-2.5">
                {isCorrect ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4.5 h-4.5 text-severity-critical shrink-0 mt-0.5" />
                )}
                <p className="text-sm font-semibold text-tx-primary leading-relaxed">{i + 1}. {q.question}</p>
              </div>

              <div className="pl-7 space-y-1.5">
                {q.options.map((opt, oi) => {
                  const isUser = oi === userAnswer;
                  const isCorrectOpt = oi === q.correctIndex;
                  return (
                    <div
                      key={oi}
                      className={`text-xs px-3 py-2 rounded-lg border ${
                        isCorrectOpt
                          ? 'border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-400 font-medium'
                          : isUser
                          ? 'border-severity-critical/30 bg-severity-critical/[0.08] text-severity-critical font-medium'
                          : 'border-surface-border text-tx-muted'
                      }`}
                    >
                      {opt} {isCorrectOpt && '✓'} {isUser && !isCorrectOpt && '✗'}
                    </div>
                  );
                })}
              </div>

              <div className="pl-7">
                <p className="text-xs text-tx-secondary leading-relaxed bg-surface-overlay/50 p-3 rounded-lg border border-surface-border">
                  <span className="font-semibold text-tx-primary">Explanation: </span>{q.explanation}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-3">
        <button onClick={() => setPhase('results')} className="btn-secondary">Back to Results</button>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">Return to Dashboard</button>
      </div>
    </div>
  );
}
