// =============================================
// ASSESSMENTS — OVERVIEW
// =============================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ListChecks, Loader } from 'lucide-react';
import { SectionHeader, Badge } from '../components/ui/index.jsx';
import { resolveIcon } from '../utils/iconMap.js';
import { AssessmentService } from '../services/assessments.service.js';
import { awarenessLevelLabel } from '../utils/riskScore.js';

export default function Assessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AssessmentService.list().then((res) => setAssessments(res.data.assessments)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-24"><Loader className="w-6 h-6 text-brand animate-spin" /></div>;

  return (
    <div className="page-wrapper">
      <SectionHeader
        title="Cybersecurity Awareness Assessments"
        subtitle="Test what you've learned with short, focused quizzes on real-world scenarios."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {assessments.map((a) => {
          const Icon = resolveIcon(a.icon);
          const result = a.latestAttempt;

          return (
            <div key={a.id} className="card p-6 flex flex-col">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-tx-primary">{a.title}</h3>
                    {result && <Badge variant="low">{result.percentage}%</Badge>}
                  </div>
                  <p className="text-sm text-tx-secondary mt-1.5 leading-relaxed">{a.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 text-xs text-tx-muted font-medium">
                <span className="flex items-center gap-1.5"><ListChecks className="w-3.5 h-3.5" />{a.questionCount} questions</span>
                {result && <span>Awareness: <strong className="text-tx-primary">{awarenessLevelLabel(result.percentage)}</strong></span>}
              </div>

              <Link to={`/assessments/${a.id}`} className="btn-primary w-full justify-center mt-5">
                {result ? 'Retake Assessment' : 'Start Assessment'}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
