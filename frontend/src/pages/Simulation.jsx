// =============================================
// PHISHING SIMULATION LAB
//
// Two clearly distinguished modes:
//  - Reviewed Practice: a small versioned bank with a server-side
//    answer key. Scored — feeds the awareness metrics.
//  - AI-Generated Practice: live Gemini generation. Labeled as
//    unreviewed model output — exploratory only, never scored.
// =============================================
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Loader, Mail, History, Sliders, Trash2, BookOpen,
  ShieldCheck, CheckCircle2, XCircle, Flag, FlaskConical, Sparkles, AlertTriangle,
} from 'lucide-react';
import { SimulationForm } from '../components/simulation/SimulationForm.jsx';
import { EmailPreview } from '../components/phishing/EmailPreview.jsx';
import { ReviewedScenarioPreview } from '../components/phishing/ReviewedScenarioPreview.jsx';
import { SectionHeader, Button, EmptyState, Badge } from '../components/ui/index.jsx';
import { PhishingService } from '../services/phishing.service.js';
import { PracticeService } from '../services/practice.service.js';
import { IMPERSONATION_BY_SCENARIO, DIFFICULTY_TO_PARAMS } from '../utils/constants.js';

/* =========================================================
 * REVIEWED PRACTICE (scored)
 * ======================================================= */
function ReviewedPracticePanel({ initialScenarioId, campaignId }) {
  const [scenarios, setScenarios] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [scenarioId, setScenarioId] = useState(initialScenarioId || '');
  const [selected, setSelected] = useState([]);
  const [outcome, setOutcome] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([PracticeService.getScenarios(), PracticeService.getIndicators()])
      .then(([sRes, iRes]) => {
        setScenarios(sRes.data.scenarios);
        setIndicators(iRes.data.indicators);
        if (!scenarioId && sRes.data.scenarios.length > 0) setScenarioId(sRes.data.scenarios[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const scenario = scenarios.find((s) => s.id === scenarioId) || null;

  const toggleIndicator = (key) => setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const submitDecision = async (decision) => {
    setSubmitting(true);
    try {
      const res = await PracticeService.submitAttempt(scenarioId, { selectedIndicators: selected, decision, campaignId });
      setOutcome(res.data);
    } catch (err) {
      toast.error(err.message || 'Could not record your decision.');
    } finally {
      setSubmitting(false);
    }
  };

  const pickScenario = (id) => {
    setScenarioId(id);
    setSelected([]);
    setOutcome(null);
  };

  if (loading) return <div className="flex items-center justify-center py-16"><Loader className="w-6 h-6 text-brand animate-spin" /></div>;
  if (!scenario) return <EmptyState icon={Mail} title="No scenarios available" description="Check back later for reviewed practice content." />;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      <div className="xl:col-span-2 space-y-4">
        <div className="card p-4 space-y-3">
          <p className="label mb-0">Choose a Scenario</p>
          <select value={scenarioId} onChange={(e) => pickScenario(e.target.value)} className="select-field">
            {scenarios.map((s) => <option key={s.id} value={s.id}>{s.category} — {s.difficulty}</option>)}
          </select>
          <p className="text-[11px] text-tx-muted leading-relaxed">
            A small reviewed bank mixing phishing and legitimate messages — reporting everything is not a winning strategy.
          </p>
        </div>
      </div>

      <div className="xl:col-span-3 space-y-4">
        <ReviewedScenarioPreview scenario={scenario} />

        {!outcome ? (
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand" />
              <h3 className="font-bold text-sm text-tx-primary">Can you identify the warning signs?</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {indicators.map((ind) => (
                <label
                  key={ind.key}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                    selected.includes(ind.key) ? 'border-brand bg-brand/[0.08] text-tx-primary' : 'border-surface-border text-tx-secondary hover:bg-surface-overlay'
                  }`}
                >
                  <input type="checkbox" checked={selected.includes(ind.key)} onChange={() => toggleIndicator(ind.key)} className="accent-brand w-3.5 h-3.5" />
                  {ind.label}
                </label>
              ))}
            </div>

            <p className="text-xs text-tx-muted">Then decide: is this message phishing, or legitimate?</p>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => submitDecision('legitimate')} disabled={submitting} variant="secondary" className="justify-center py-3">
                This Looks Legitimate
              </Button>
              <Button onClick={() => submitDecision('phishing')} disabled={submitting} className="justify-center py-3">
                <Flag className="w-4 h-4" /> Report as Phishing
              </Button>
            </div>
          </div>
        ) : (
          <div className="card p-5 space-y-4 animate-fade-in">
            <div className={`flex items-center gap-2.5 p-3 rounded-lg border ${outcome.decisionCorrect ? 'border-emerald-500/30 bg-emerald-500/[0.08]' : 'border-severity-critical/30 bg-severity-critical/[0.08]'}`}>
              {outcome.decisionCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <XCircle className="w-5 h-5 text-severity-critical shrink-0" />}
              <p className="text-sm font-semibold text-tx-primary">
                {outcome.decisionCorrect
                  ? `Correct — this message was ${outcome.isLegitimate ? 'legitimate' : 'phishing'}.`
                  : `Not quite — this message was actually ${outcome.isLegitimate ? 'legitimate' : 'phishing'}.`}
              </p>
            </div>

            <p className="text-xs text-tx-secondary leading-relaxed bg-surface-overlay/50 p-3 rounded-lg border border-surface-border">
              {outcome.tacticsSummary}
            </p>

            {outcome.indicators.missed.length > 0 && (
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1.5">Missed</p>
                <ul className="space-y-1">
                  {outcome.indicators.missed.map((i) => <li key={i.key} className="flex items-center gap-2 text-xs text-tx-secondary"><XCircle className="w-3.5 h-3.5 text-amber-500" />{i.label}</li>)}
                </ul>
              </div>
            )}
            {outcome.indicators.falsePositives.length > 0 && (
              <div>
                <p className="text-xs font-bold text-tx-muted uppercase tracking-wider mb-1.5">Not actually present here</p>
                <ul className="space-y-1">
                  {outcome.indicators.falsePositives.map((i) => <li key={i.key} className="flex items-center gap-2 text-xs text-tx-muted"><XCircle className="w-3.5 h-3.5" />{i.label}</li>)}
                </ul>
              </div>
            )}
            {outcome.indicators.correctlyIdentified.length > 0 && (
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1.5">Correctly identified</p>
                <ul className="space-y-1">
                  {outcome.indicators.correctlyIdentified.map((i) => <li key={i.key} className="flex items-center gap-2 text-xs text-tx-secondary"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{i.label}</li>)}
                </ul>
              </div>
            )}

            {!outcome.isFirstAttempt && (
              <p className="text-[11px] text-tx-muted italic">This was a practice retry — only your first attempt on this scenario counts toward your awareness score.</p>
            )}

            <Button onClick={() => pickScenario(scenarios[(scenarios.findIndex((s) => s.id === scenarioId) + 1) % scenarios.length].id)} variant="secondary" className="w-full justify-center">
              Try Another Scenario
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
 * AI-GENERATED PRACTICE (unscored, exploratory)
 * ======================================================= */
function AiGeneratedPanel() {
  const [activeTab, setActiveTab] = useState('workspace');
  const [available, setAvailable] = useState(true);
  const [simulation, setSimulation] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [explainLoading, setExplainLoading] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [fetchingLogs, setFetchingLogs] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  useEffect(() => {
    PhishingService.status().then((res) => setAvailable(res.data.available)).catch(() => setAvailable(false));
  }, []);

  const fetchLogs = async () => {
    setFetchingLogs(true);
    try {
      const res = await PhishingService.getHistory();
      setHistoryLogs(res.data || []);
    } catch (_) {
      toast.error('Could not load recent scenarios.');
    } finally {
      setFetchingLogs(false);
    }
  };

  useEffect(() => { if (activeTab === 'history') fetchLogs(); }, [activeTab]);

  const handleGenerate = async ({ scenarioType, targetContext, difficulty }) => {
    setLoading(true);
    setSimulation(null);
    setExplanation(null);
    setActiveTab('workspace');
    try {
      const diffParams = DIFFICULTY_TO_PARAMS[difficulty];
      const res = await PhishingService.generateEmail({
        category: scenarioType,
        target: targetContext,
        impersonation: IMPERSONATION_BY_SCENARIO[scenarioType],
        ...diffParams,
      });
      setSimulation(res.data);
      toast.success('AI-generated practice scenario created.');
    } catch (err) {
      toast.error(err.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!simulation) return;
    setExplainLoading(true);
    try {
      const res = await PhishingService.generateExplanation({
        emailSubject: simulation.subject,
        category: simulation.params?.category,
        tactics: simulation.manipulationTechniques || [],
      });
      setExplanation(res.data);
    } catch (err) {
      toast.error(err.message || 'Explanation failed.');
    } finally {
      setExplainLoading(false);
    }
  };

  const handleDeleteLogItem = async (e, id) => {
    e.stopPropagation();
    try {
      await PhishingService.deleteHistoryItem(id);
      setHistoryLogs((prev) => prev.filter((log) => log.id !== id));
      if (simulation?.id === id) { setSimulation(null); setExplanation(null); }
      toast.success('Scenario removed.');
    } catch (_) {
      toast.error('Could not remove scenario.');
    }
  };

  const handleClearAllLogs = async () => {
    if (!window.confirm('Clear all your recent scenarios? This cannot be undone.')) return;
    setClearingAll(true);
    try {
      await PhishingService.clearAllHistory();
      setHistoryLogs([]);
      setSimulation(null);
      setExplanation(null);
      toast.success('Recent scenarios cleared.');
    } catch (_) {
      toast.error('Could not clear scenarios.');
    } finally {
      setClearingAll(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card p-3 flex items-start gap-2.5 bg-amber-500/[0.06] border-amber-500/20">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-tx-secondary leading-relaxed">
          <strong className="text-tx-primary">AI-generated practice</strong> is exploratory, unreviewed model output — it is not scored
          and any "red flags" shown below are the model's own text, not a verified answer key.
        </p>
      </div>

      {!available && (
        <div className="card p-4 text-center text-sm text-tx-muted">
          AI-generated practice is currently unavailable — no AI provider is configured on the server.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2">
          <SimulationForm onGenerate={handleGenerate} loading={loading} disabled={!available} />
        </div>

        <div className="xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-2 gap-4 flex-wrap">
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('workspace')} className={`tab-btn flex items-center gap-2 ${activeTab === 'workspace' ? 'active' : ''}`}>
                <Sliders className="w-3.5 h-3.5" /> Workspace
              </button>
              <button onClick={() => setActiveTab('history')} className={`tab-btn flex items-center gap-2 ${activeTab === 'history' ? 'active' : ''}`}>
                <History className="w-3.5 h-3.5" /> Recent Scenarios
              </button>
            </div>
            {activeTab === 'history' && historyLogs.length > 0 && (
              <button onClick={handleClearAllLogs} disabled={clearingAll} className="flex items-center gap-1.5 text-xs font-bold text-severity-critical hover:bg-severity-critical/[0.08] px-3 py-1.5 rounded-lg border border-severity-critical/20 transition-all disabled:opacity-50">
                <Trash2 className="w-3.5 h-3.5" /> {clearingAll ? 'Clearing…' : 'Clear All'}
              </button>
            )}
          </div>

          {activeTab === 'workspace' && (
            <div className="space-y-4">
              {loading && (
                <div className="card p-12 flex flex-col items-center justify-center gap-4">
                  <Loader className="w-8 h-8 text-brand animate-spin" />
                  <div className="text-sm font-bold text-tx-primary">Generating training scenario…</div>
                </div>
              )}
              {!loading && !simulation && (
                <EmptyState icon={Mail} title="No scenario yet" description="Configure a scenario on the left and generate a training example to begin." />
              )}
              {!loading && simulation && (
                <>
                  <EmailPreview simulation={simulation} />

                  {simulation.redFlags?.length > 0 && (
                    <div className="card p-4">
                      <p className="text-xs font-bold text-tx-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand" /> Signals the AI model flagged (unreviewed)
                      </p>
                      <ul className="space-y-1.5">
                        {simulation.redFlags.map((f, i) => <li key={i} className="text-xs text-tx-secondary flex items-start gap-2"><span className="text-brand font-bold shrink-0">›</span>{f}</li>)}
                      </ul>
                    </div>
                  )}

                  <Button onClick={handleExplain} loading={explainLoading} disabled={explainLoading} variant="secondary" className="w-full justify-center py-3 font-semibold">
                    <BookOpen className="w-4 h-4 text-brand" /> {explainLoading ? 'Analyzing tactics…' : 'Why Does This Work? (Technical Explanation)'}
                  </Button>

                  {explanation && (
                    <div className="card p-5 animate-slide-up space-y-4">
                      <h3 className="font-bold text-base text-tx-primary flex items-center gap-2"><BookOpen className="w-4 h-4 text-brand" /> Attack Breakdown</h3>
                      <p className="text-sm text-tx-secondary leading-relaxed">{explanation.overview}</p>
                      <div className="p-4 rounded-xl bg-surface-overlay border border-surface-border">
                        <div className="label">Why It Works</div>
                        <p className="text-xs text-tx-secondary leading-relaxed">{explanation.whyItWorks}</p>
                      </div>
                      {explanation.protectionTips?.length > 0 && (
                        <div>
                          <div className="label">How to Protect Yourself</div>
                          <ul className="space-y-2">
                            {explanation.protectionTips.map((tip, i) => <li key={i} className="flex items-start gap-2 text-xs text-tx-secondary leading-relaxed"><span className="text-brand font-bold shrink-0 mt-0.5">{i + 1}.</span>{tip}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {fetchingLogs ? (
                <div className="flex items-center justify-center py-20"><Loader className="w-6 h-6 text-brand animate-spin" /></div>
              ) : historyLogs.length === 0 ? (
                <EmptyState icon={History} title="No recent scenarios" description="Generated training scenarios will appear here." />
              ) : (
                <div className="card divide-y divide-surface-border overflow-hidden">
                  {historyLogs.map((log) => (
                    <div key={log.id} onClick={() => { setSimulation(log); setExplanation(null); setActiveTab('workspace'); }} className="p-4 hover:bg-surface-overlay/40 transition-colors cursor-pointer flex items-center justify-between gap-4 group">
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-mono text-brand font-semibold block mb-0.5">{log.params?.category || 'Scenario'}</span>
                        <h4 className="font-bold text-sm text-tx-primary truncate group-hover:text-brand transition-colors">{log.subject}</h4>
                        <p className="text-[11px] text-tx-muted truncate mt-0.5">Impersonating: <span className="text-tx-secondary font-medium">{log.sender?.name}</span> ({log.sender?.email})</p>
                      </div>
                      <button onClick={(e) => handleDeleteLogItem(e, log.id)} className="p-2 text-tx-muted hover:text-severity-critical hover:bg-severity-critical/[0.08] rounded-lg transition-all shrink-0" title="Remove scenario">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
 * PAGE
 * ======================================================= */
export default function Simulation() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'ai' ? 'ai' : 'reviewed';
  const [mode, setMode] = useState(initialTab);

  return (
    <div className="page-wrapper">
      <SectionHeader
        title="Phishing Simulation Lab"
        subtitle="Practice identifying suspicious messages in a controlled learning environment."
      />

      <div className="flex gap-2 border-b border-surface-border pb-2">
        <button onClick={() => setMode('reviewed')} className={`tab-btn flex items-center gap-2 ${mode === 'reviewed' ? 'active' : ''}`}>
          <ShieldCheck className="w-3.5 h-3.5" /> Reviewed Practice
        </button>
        <button onClick={() => setMode('ai')} className={`tab-btn flex items-center gap-2 ${mode === 'ai' ? 'active' : ''}`}>
          <FlaskConical className="w-3.5 h-3.5" /> AI-Generated Practice
        </button>
      </div>

      {mode === 'reviewed'
        ? <ReviewedPracticePanel initialScenarioId={searchParams.get('scenarioId')} campaignId={searchParams.get('campaignId') ? Number(searchParams.get('campaignId')) : undefined} />
        : <AiGeneratedPanel />}
    </div>
  );
}
