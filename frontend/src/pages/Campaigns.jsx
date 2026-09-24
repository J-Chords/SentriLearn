// =============================================
// SIMULATION CAMPAIGNS — CONTROLLED AWARENESS EXERCISES
// Local/demo only. No real email is ever sent.
// =============================================
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Target, Plus, Users, Calendar, ChevronDown, ChevronUp, Trash2, X,
} from 'lucide-react';
import { SectionHeader, Badge, Button, ProgressBar, EmptyState } from '../components/ui/index.jsx';
import { STORAGE_KEYS, readStorage, writeStorage, ensureSeeded } from '../utils/storage.js';
import {
  DEFAULT_CAMPAIGNS, CAMPAIGN_SCENARIOS, CAMPAIGN_TARGET_GROUPS,
  CAMPAIGN_DIFFICULTIES, CAMPAIGN_STATUSES,
} from '../data/campaigns.js';
import { formatDate } from '../utils/helpers.js';

const STATUS_VARIANT = { Draft: 'ghost', Active: 'medium', Completed: 'low' };

const defaultForm = {
  name: '',
  target: CAMPAIGN_TARGET_GROUPS[0],
  scenario: CAMPAIGN_SCENARIOS[0],
  difficulty: CAMPAIGN_DIFFICULTIES[0],
  startDate: new Date().toISOString().slice(0, 10),
  description: '',
};

function NewCampaignModal({ onClose, onCreate }) {
  const [form, setForm] = useState(defaultForm);
  const update = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = () => {
    if (!form.name.trim()) return toast.error('Campaign name is required');
    onCreate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card w-full max-w-lg p-6 space-y-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-tx-primary">New Campaign</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-tx-muted hover:text-tx-primary hover:bg-surface-overlay">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="label">Campaign Name</label>
          <input type="text" value={form.name} onChange={update('name')} placeholder="e.g. Fall Semester Password Reset Drill" className="input-field" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Target Group</label>
            <select value={form.target} onChange={update('target')} className="select-field">
              {CAMPAIGN_TARGET_GROUPS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Scenario</label>
            <select value={form.scenario} onChange={update('scenario')} className="select-field">
              {CAMPAIGN_SCENARIOS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Difficulty</label>
            <select value={form.difficulty} onChange={update('difficulty')} className="select-field">
              {CAMPAIGN_DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Start Date</label>
            <input type="date" value={form.startDate} onChange={update('startDate')} className="input-field" />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            value={form.description}
            onChange={update('description')}
            rows={3}
            placeholder="Briefly describe the exercise..."
            className="input-field resize-none"
          />
        </div>

        <Button onClick={submit} className="w-full justify-center">
          <Plus className="w-4 h-4" /> Create Campaign
        </Button>
      </div>
    </div>
  );
}

function CampaignRow({ campaign, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-brand" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <h3 className="font-bold text-tx-primary">{campaign.name}</h3>
              <Badge variant={STATUS_VARIANT[campaign.status] || 'ghost'}>{campaign.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-tx-muted">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{campaign.target}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(campaign.startDate)}</span>
              <Badge variant="brand">{campaign.scenario}</Badge>
            </div>
          </div>
        </div>

        <p className="text-sm text-tx-secondary leading-relaxed mt-3">{campaign.description}</p>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-lg bg-surface-overlay border border-surface-border text-center">
            <p className="text-lg font-bold text-tx-primary">{campaign.participants}</p>
            <p className="text-[10px] text-tx-muted uppercase tracking-wide">Participants</p>
          </div>
          <div className="p-3 rounded-lg bg-surface-overlay border border-surface-border text-center">
            <p className="text-lg font-bold text-emerald-600">{campaign.detectionRate}%</p>
            <p className="text-[10px] text-tx-muted uppercase tracking-wide">Detection Rate</p>
          </div>
          <div className="p-3 rounded-lg bg-surface-overlay border border-surface-border text-center">
            <p className="text-lg font-bold text-brand">{campaign.reportRate}%</p>
            <p className="text-[10px] text-tx-muted uppercase tracking-wide">Report Rate</p>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-surface-border space-y-3 animate-fade-in">
            <div>
              <p className="text-[11px] font-semibold text-tx-muted mb-1">Detection Rate</p>
              <ProgressBar percent={campaign.detectionRate} color="green" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-tx-muted mb-1">Report Rate</p>
              <ProgressBar percent={campaign.reportRate} color="brand" />
            </div>
            <p className="text-xs text-tx-muted">Difficulty: <span className="text-tx-primary font-medium">{campaign.difficulty}</span></p>
          </div>
        )}
      </div>

      <div className="border-t border-surface-border px-5 py-3 flex items-center justify-between bg-surface-overlay/30">
        <button onClick={() => setExpanded((v) => !v)} className="flex items-center gap-1.5 text-xs font-medium text-tx-secondary hover:text-brand transition-colors">
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" />Hide Results</> : <><ChevronDown className="w-3.5 h-3.5" />View Results</>}
        </button>
        <Button variant="danger" onClick={() => onDelete(campaign.id)}>
          <Trash2 className="w-3.5 h-3.5" />Delete
        </Button>
      </div>
    </div>
  );
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setCampaigns(ensureSeeded(STORAGE_KEYS.CAMPAIGNS, DEFAULT_CAMPAIGNS) || DEFAULT_CAMPAIGNS);
  }, []);

  const handleCreate = (form) => {
    const campaign = {
      id: `campaign-${Date.now()}`,
      name: form.name,
      target: form.target,
      scenario: form.scenario,
      difficulty: form.difficulty,
      status: 'Draft',
      participants: 0,
      detectionRate: 0,
      reportRate: 0,
      startDate: form.startDate,
      description: form.description || 'No description provided.',
    };
    const updated = [campaign, ...campaigns];
    setCampaigns(updated);
    writeStorage(STORAGE_KEYS.CAMPAIGNS, updated);
    setShowModal(false);
    toast.success('Campaign created — saved locally.');
  };

  const handleDelete = (id) => {
    const updated = campaigns.filter((c) => c.id !== id);
    setCampaigns(updated);
    writeStorage(STORAGE_KEYS.CAMPAIGNS, updated);
    toast.success('Campaign deleted.');
  };

  const visibleCampaigns = statusFilter === 'All' ? campaigns : campaigns.filter((c) => c.status === statusFilter);

  return (
    <div className="page-wrapper">
      <SectionHeader
        title="Simulation Campaigns"
        subtitle="Manage controlled phishing-awareness exercises and review learner outcomes."
        action={
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" /> New Campaign
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        {['All', ...CAMPAIGN_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`tab-btn ${statusFilter === s ? 'active' : ''}`}
          >
            {s}
          </button>
        ))}
      </div>

      {visibleCampaigns.length === 0 ? (
        <EmptyState icon={Target} title="No campaigns" description="Create a campaign to get started, or clear your status filter." />
      ) : (
        <div className="space-y-4">
          {visibleCampaigns.map((c) => (
            <CampaignRow key={c.id} campaign={c} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && <NewCampaignModal onClose={() => setShowModal(false)} onCreate={handleCreate} />}
    </div>
  );
}
