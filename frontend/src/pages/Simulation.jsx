// =============================================
// PHISHING SIMULATION LAB
// Preserves the existing Gemini-backed /api/phishing endpoints.
// =============================================
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Loader, Mail, History, Sliders, Trash2, BookOpen,
  ShieldCheck, CheckCircle2, XCircle, Flag,
} from 'lucide-react';
import { SimulationForm } from '../components/simulation/SimulationForm.jsx';
import { EmailPreview } from '../components/phishing/EmailPreview.jsx';
import { SectionHeader, Button, EmptyState } from '../components/ui/index.jsx';
import { PhishingService } from '../services/phishing.service.js';
import { IMPERSONATION_BY_SCENARIO, DIFFICULTY_TO_PARAMS } from '../utils/constants.js';
import { WARNING_INDICATORS, analyzeSimulationIndicators } from '../utils/indicatorAnalysis.js';
import { recordSimulationCheck, recordSimulationReported } from '../utils/progressStore.js';

function IndicatorCheck({ simulation, onChecked }) {
  const [selected, setSelected] = useState([]);
  const [checked, setChecked] = useState(false);
  const [outcome, setOutcome] = useState(null);

  useEffect(() => {
    setSelected([]);
    setChecked(false);
    setOutcome(null);
  }, [simulation?.id]);

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const checkAnalysis = () => {
    const truth = analyzeSimulationIndicators(simulation);
    const actualPositives = WARNING_INDICATORS.filter((i) => truth[i.id]);
    const correctlyIdentified = actualPositives.filter((i) => selected.includes(i.id));
    const missed = actualPositives.filter((i) => !selected.includes(i.id));
    const falsePositives = WARNING_INDICATORS.filter((i) => selected.includes(i.id) && !truth[i.id]);

    setOutcome({ actualPositives, correctlyIdentified, missed, falsePositives });
    setChecked(true);
    recordSimulationCheck({ shown: actualPositives.length, identified: correctlyIdentified.length });
    onChecked?.();
  };

  const reportPhishing = () => {
    recordSimulationReported();
    toast.success('Reported as phishing — thank you for practicing this habit.');
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-brand" />
        <h3 className="font-bold text-sm text-tx-primary">Can you identify the warning signs?</h3>
      </div>
      <p className="text-xs text-tx-muted">Select every indicator you can spot in this simulated message, then check your analysis.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {WARNING_INDICATORS.map((ind) => (
          <label
            key={ind.id}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
              selected.includes(ind.id) ? 'border-brand bg-brand/[0.08] text-tx-primary' : 'border-surface-border text-tx-secondary hover:bg-surface-overlay'
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(ind.id)}
              onChange={() => toggle(ind.id)}
              className="accent-brand w-3.5 h-3.5"
            />
            {ind.label}
          </label>
        ))}
      </div>

      <Button onClick={checkAnalysis} disabled={selected.length === 0} className="w-full justify-center">
        Check My Analysis
      </Button>

      {checked && outcome && (
        <div className="animate-fade-in space-y-3 pt-2 border-t border-surface-border">
          <p className="text-sm font-semibold text-tx-primary">
            {outcome.missed.length === 0
              ? `Great job — you identified all ${outcome.actualPositives.length} warning signs.`
              : `Great job — you identified ${outcome.correctlyIdentified.length} of ${outcome.actualPositives.length} warning signs.`}
          </p>

          {outcome.missed.length > 0 && (
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1.5">Missed</p>
              <ul className="space-y-1">
                {outcome.missed.map((i) => (
                  <li key={i.id} className="flex items-center gap-2 text-xs text-tx-secondary"><XCircle className="w-3.5 h-3.5 text-amber-500" />{i.label}</li>
                ))}
              </ul>
            </div>
          )}

          {outcome.falsePositives.length > 0 && (
            <div>
              <p className="text-xs font-bold text-tx-muted uppercase tracking-wider mb-1.5">Not actually present here</p>
              <ul className="space-y-1">
                {outcome.falsePositives.map((i) => (
                  <li key={i.id} className="flex items-center gap-2 text-xs text-tx-muted"><XCircle className="w-3.5 h-3.5" />{i.label}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1.5">Correctly identified</p>
            <ul className="space-y-1">
              {outcome.correctlyIdentified.map((i) => (
                <li key={i.id} className="flex items-center gap-2 text-xs text-tx-secondary"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{i.label}</li>
              ))}
            </ul>
          </div>

          <Button onClick={reportPhishing} variant="secondary" className="w-full justify-center">
            <Flag className="w-4 h-4" /> Report as Phishing
          </Button>
        </div>
      )}
    </div>
  );
}

export default function Simulation() {
  const [activeTab, setActiveTab] = useState('workspace');
  const [simulation, setSimulation] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [explainLoading, setExplainLoading] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [fetchingLogs, setFetchingLogs] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  const fetchLogs = async () => {
    setFetchingLogs(true);
    try {
      const res = await PhishingService.getHistory();
      setHistoryLogs(res.data || []);
    } catch (_) {
      toast.error('Could not load recent scenarios. Is the backend running?');
    } finally {
      setFetchingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') fetchLogs();
  }, [activeTab]);

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
      toast.success('Training scenario generated!');
    } catch (err) {
      toast.error(err.message || 'Generation failed. Check that the backend and Gemini API key are configured.');
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
      if (simulation?.id === id) {
        setSimulation(null);
        setExplanation(null);
      }
      toast.success('Scenario removed.');
    } catch (_) {
      toast.error('Could not remove scenario.');
    }
  };

  const handleClearAllLogs = async () => {
    if (!window.confirm('Clear all recent scenarios? This cannot be undone.')) return;
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
    <div className="page-wrapper">
      <SectionHeader
        title="Phishing Simulation Lab"
        subtitle="Practice identifying suspicious messages in a controlled learning environment."
      />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2">
          <SimulationForm onGenerate={handleGenerate} loading={loading} />
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
              <button
                onClick={handleClearAllLogs}
                disabled={clearingAll}
                className="flex items-center gap-1.5 text-xs font-bold text-severity-critical hover:bg-severity-critical/[0.08] px-3 py-1.5 rounded-lg border border-severity-critical/20 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {clearingAll ? 'Clearing…' : 'Clear All'}
              </button>
            )}
          </div>

          {activeTab === 'workspace' && (
            <div className="space-y-4">
              {loading && (
                <div className="card p-12 flex flex-col items-center justify-center gap-4">
                  <Loader className="w-8 h-8 text-brand animate-spin" />
                  <div className="text-sm font-bold text-tx-primary">Generating training scenario…</div>
                  <div className="text-xs text-tx-muted">Querying the AI content engine</div>
                </div>
              )}

              {!loading && !simulation && (
                <EmptyState
                  icon={Mail}
                  title="No scenario yet"
                  description="Configure a scenario on the left and generate a training example to begin."
                />
              )}

              {!loading && simulation && (
                <>
                  <EmailPreview simulation={simulation} />
                  <IndicatorCheck simulation={simulation} />

                  <Button
                    onClick={handleExplain}
                    loading={explainLoading}
                    disabled={explainLoading}
                    variant="secondary"
                    className="w-full justify-center py-3 font-semibold"
                  >
                    <BookOpen className="w-4 h-4 text-brand" />
                    {explainLoading ? 'Analyzing tactics…' : 'Why Does This Work? (Technical Explanation)'}
                  </Button>

                  {explanation && (
                    <div className="card p-5 animate-slide-up space-y-4">
                      <h3 className="font-bold text-base text-tx-primary flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-brand" /> Attack Breakdown
                      </h3>
                      <p className="text-sm text-tx-secondary leading-relaxed">{explanation.overview}</p>

                      <div className="p-4 rounded-xl bg-surface-overlay border border-surface-border">
                        <div className="label">Why It Works</div>
                        <p className="text-xs text-tx-secondary leading-relaxed">{explanation.whyItWorks}</p>
                      </div>

                      {explanation.protectionTips?.length > 0 && (
                        <div>
                          <div className="label">How to Protect Yourself</div>
                          <ul className="space-y-2">
                            {explanation.protectionTips.map((tip, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-tx-secondary leading-relaxed">
                                <span className="text-brand font-bold shrink-0 mt-0.5">{i + 1}.</span>{tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-surface-border">
                        <div>
                          <div className="label">Difficulty to Detect</div>
                          <span className="text-xs font-mono font-bold text-amber-600 uppercase bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                            {explanation.difficultyToDetect}
                          </span>
                        </div>
                        <div>
                          <div className="label">Industry Context</div>
                          <p className="text-xs text-tx-muted leading-relaxed">{explanation.industryContext}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {fetchingLogs ? (
                <div className="flex items-center justify-center py-20">
                  <Loader className="w-6 h-6 text-brand animate-spin" />
                </div>
              ) : historyLogs.length === 0 ? (
                <EmptyState icon={History} title="No recent scenarios" description="Generated training scenarios will appear here." />
              ) : (
                <div className="card divide-y divide-surface-border overflow-hidden">
                  {historyLogs.map((log) => (
                    <div
                      key={log.id}
                      onClick={() => { setSimulation(log); setExplanation(null); setActiveTab('workspace'); }}
                      className="p-4 hover:bg-surface-overlay/40 transition-colors cursor-pointer flex items-center justify-between gap-4 group"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-mono text-brand font-semibold block mb-0.5">{log.params?.category || 'Scenario'}</span>
                        <h4 className="font-bold text-sm text-tx-primary truncate group-hover:text-brand transition-colors">{log.subject}</h4>
                        <p className="text-[11px] text-tx-muted truncate mt-0.5">
                          Impersonating: <span className="text-tx-secondary font-medium">{log.sender?.name}</span> ({log.sender?.email})
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteLogItem(e, log.id)}
                        className="p-2 text-tx-muted hover:text-severity-critical hover:bg-severity-critical/[0.08] rounded-lg transition-all shrink-0"
                        title="Remove scenario"
                      >
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
