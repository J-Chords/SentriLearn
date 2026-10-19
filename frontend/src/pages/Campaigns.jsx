// =============================================
// SIMULATION CAMPAIGNS
// Admin: create / activate / complete / archive.
// Learner: view assigned exercises and personal completion.
// No real email is ever sent.
// =============================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Target, Plus, Users, Calendar, ChevronDown, ChevronUp, X, Loader,
  PlayCircle, CheckCircle2, Archive, ExternalLink,
} from 'lucide-react';
import { SectionHeader, Badge, Button, ProgressBar, EmptyState } from '../components/ui/index.jsx';
import { CampaignService } from '../services/campaigns.service.js';
import { PracticeService } from '../services/practice.service.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../utils/helpers.js';

const STATUS_VARIANT = { draft: 'ghost', active: 'medium', completed: 'low', archived: 'ghost' };
const TARGET_CATEGORIES = ['student', 'employee', 'both'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

function NewCampaignModal({ scenarios, onClose, onCreate }) {
  const [form, setForm] = useState({
    name: '', targetCategory: 'student', difficulty: 'Beginner', description: '', startDate: '', scenarioIds: [],
  });
  const update = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const toggleScenario = (id) => setForm((p) => ({
    ...p, scenarioIds: p.scenarioIds.includes(id) ? p.scenarioIds.filter((x) => x !== id) : [...p.scenarioIds, id],
  }));

  const submit = () => {
    if (!form.name.trim()) return toast.error('Campaign name is required');
    if (form.scenarioIds.length === 0) return toast.error('Select at least one reviewed scenario');
    onCreate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="card w-full max-w-lg p-6 space-y-4 animate-slide-up my-8">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-tx-primary">New Campaign</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-tx-muted hover:text-tx-primary hover:bg-surface-overlay"><X className="w-4 h-4" /></button>
        </div>

        <div>
          <label className="label">Campaign Name</label>
          <input type="text" value={form.name} onChange={update('name')} placeholder="e.g. Fall Semester Password Reset Drill" className="input-field" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Target Group</label>
            <select value={form.targetCategory} onChange={update('targetCategory')} className="select-field">
              {TARGET_CATEGORIES.map((t) => <option key={t} value={t}>{t === 'both' ? 'Students & Employees' : `${t[0].toUpperCase()}${t.slice(1)}s`}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select value={form.difficulty} onChange={update('difficulty')} className="select-field">
              {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Start Date</label>
          <input type="date" value={form.startDate} onChange={update('startDate')} className="input-field" />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea value={form.description} onChange={update('description')} rows={2} placeholder="Briefly describe the exercise..." className="input-field resize-none" />
        </div>

        <div>
          <label className="label">Reviewed Scenarios (select one or more)</label>
          <div className="max-h-40 overflow-y-auto space-y-1.5 border border-surface-border rounded-lg p-2">
            {scenarios.map((s) => (
              <label key={s.id} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs cursor-pointer ${form.scenarioIds.includes(s.id) ? 'bg-brand/[0.08] text-tx-primary' : 'text-tx-secondary hover:bg-surface-overlay'}`}>
                <input type="checkbox" checked={form.scenarioIds.includes(s.id)} onChange={() => toggleScenario(s.id)} className="accent-brand w-3.5 h-3.5" />
                {s.subject} <span className="text-tx-muted">({s.category})</span>
              </label>
            ))}
          </div>
        </div>

        <Button onClick={submit} className="w-full justify-center"><Plus className="w-4 h-4" /> Create Campaign</Button>
      </div>
    </div>
  );
}

function AdminCampaignRow({ campaign, onActivate, onComplete, onArchive }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0"><Target className="w-5 h-5 text-brand" /></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <h3 className="font-bold text-tx-primary">{campaign.name}</h3>
              <Badge variant={STATUS_VARIANT[campaign.status]}>{campaign.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-tx-muted">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{campaign.targetCategory}</span>
              {campaign.startDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(campaign.startDate)}</span>}
              <Badge variant="brand">{campaign.difficulty}</Badge>
            </div>
          </div>
        </div>
        {campaign.description && <p className="text-sm text-tx-secondary leading-relaxed mt-3">{campaign.description}</p>}

        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="p-3 rounded-lg bg-surface-overlay border border-surface-border text-center">
            <p className="text-lg font-bold text-tx-primary">{campaign.assignedCount}</p>
            <p className="text-[10px] text-tx-muted uppercase tracking-wide">Assigned</p>
          </div>
          <div className="p-3 rounded-lg bg-surface-overlay border border-surface-border text-center">
            <p className="text-lg font-bold text-tx-primary">{campaign.completedLearnerCount}</p>
            <p className="text-[10px] text-tx-muted uppercase tracking-wide">Completed</p>
          </div>
          <div className="p-3 rounded-lg bg-surface-overlay border border-surface-border text-center">
            <p className="text-lg font-bold text-emerald-600">{campaign.detectionRate ?? '—'}{campaign.detectionRate != null && '%'}</p>
            <p className="text-[10px] text-tx-muted uppercase tracking-wide">Detection</p>
          </div>
          <div className="p-3 rounded-lg bg-surface-overlay border border-surface-border text-center">
            <p className="text-lg font-bold text-brand">{campaign.reportRate ?? '—'}{campaign.reportRate != null && '%'}</p>
            <p className="text-[10px] text-tx-muted uppercase tracking-wide">Reported</p>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-surface-border space-y-2 animate-fade-in">
            <p className="text-[11px] font-semibold text-tx-muted">Scenarios in this campaign</p>
            {campaign.scenarios.map((s) => <p key={s.id} className="text-xs text-tx-secondary">• {s.subject}</p>)}
          </div>
        )}
      </div>

      <div className="border-t border-surface-border px-5 py-3 flex items-center justify-between bg-surface-overlay/30 flex-wrap gap-2">
        <button onClick={() => setExpanded((v) => !v)} className="flex items-center gap-1.5 text-xs font-medium text-tx-secondary hover:text-brand transition-colors">
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" />Hide Scenarios</> : <><ChevronDown className="w-3.5 h-3.5" />View Scenarios</>}
        </button>
        <div className="flex gap-2">
          {campaign.status === 'draft' && <Button onClick={() => onActivate(campaign.id)} className="text-xs px-3 py-1.5"><PlayCircle className="w-3.5 h-3.5" />Activate</Button>}
          {campaign.status === 'active' && <Button onClick={() => onComplete(campaign.id)} variant="secondary" className="text-xs px-3 py-1.5"><CheckCircle2 className="w-3.5 h-3.5" />Mark Completed</Button>}
          {campaign.status !== 'archived' && <Button onClick={() => onArchive(campaign.id)} variant="danger" className="text-xs px-3 py-1.5"><Archive className="w-3.5 h-3.5" />Archive</Button>}
        </div>
      </div>
    </div>
  );
}

function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => Promise.all([CampaignService.listAll(), PracticeService.getScenarios()])
    .then(([cRes, sRes]) => { setCampaigns(cRes.data.campaigns); setScenarios(sRes.data.scenarios); })
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleCreate = async (form) => {
    try {
      await CampaignService.create(form);
      toast.success('Campaign created.');
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Could not create campaign.');
    }
  };

  const wrap = (fn) => async (id) => {
    try { await fn(id); load(); } catch (err) { toast.error(err.message || 'Action failed.'); }
  };
  const handleActivate = wrap((id) => CampaignService.activate(id));
  const handleComplete = wrap((id) => CampaignService.complete(id));
  const handleArchive = wrap((id) => CampaignService.archive(id));

  if (loading) return <div className="flex items-center justify-center py-24"><Loader className="w-6 h-6 text-brand animate-spin" /></div>;

  const visible = statusFilter === 'all' ? campaigns : campaigns.filter((c) => c.status === statusFilter);

  return (
    <div className="page-wrapper">
      <SectionHeader
        title="Simulation Campaigns"
        subtitle="Manage controlled phishing-awareness exercises and review learner outcomes."
        action={<Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> New Campaign</Button>}
      />

      <div className="flex items-center gap-2">
        {['all', 'draft', 'active', 'completed', 'archived'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`tab-btn capitalize ${statusFilter === s ? 'active' : ''}`}>{s}</button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={Target} title="No campaigns" description="Create a campaign to get started, or clear your status filter." />
      ) : (
        <div className="space-y-4">
          {visible.map((c) => <AdminCampaignRow key={c.id} campaign={c} onActivate={handleActivate} onComplete={handleComplete} onArchive={handleArchive} />)}
        </div>
      )}

      {showModal && <NewCampaignModal scenarios={scenarios} onClose={() => setShowModal(false)} onCreate={handleCreate} />}
    </div>
  );
}

function LearnerCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CampaignService.listMine().then((res) => setCampaigns(res.data.campaigns)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-24"><Loader className="w-6 h-6 text-brand animate-spin" /></div>;

  return (
    <div className="page-wrapper">
      <SectionHeader title="Simulation Campaigns" subtitle="Complete your assigned practice exercises below." />

      {campaigns.length === 0 ? (
        <EmptyState icon={Target} title="No campaigns assigned" description="Your administrator hasn't assigned you any campaigns yet." />
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="font-bold text-tx-primary">{c.name}</h3>
                  <p className="text-xs text-tx-muted mt-0.5">{c.description}</p>
                </div>
                <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-[11px] font-semibold mb-1.5"><span className="text-tx-secondary">Your Progress</span><span className="text-tx-primary">{c.myProgress.completed}/{c.myProgress.total}</span></div>
                <ProgressBar percent={c.myProgress.total === 0 ? 0 : (c.myProgress.completed / c.myProgress.total) * 100} />
              </div>

              <div className="mt-4 space-y-2">
                {c.scenarios.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface-overlay border border-surface-border">
                    <span className="text-xs font-medium text-tx-primary truncate">{s.subject}</span>
                    {s.completed ? (
                      <Badge variant="low"><CheckCircle2 className="w-3 h-3" /> Done</Badge>
                    ) : (
                      <Link to={`/simulation?scenarioId=${s.id}&campaignId=${c.id}`} className="btn-primary text-xs px-3 py-1.5 shrink-0">
                        Complete Exercise <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Campaigns() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminCampaigns /> : <LearnerCampaigns />;
}
