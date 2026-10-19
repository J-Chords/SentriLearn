// =============================================
// SIMULATION LAB — SCENARIO CONFIGURATION FORM
// =============================================
import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { Button } from '../ui/index.jsx';
import { SCENARIO_TYPES, TARGET_CONTEXTS, DIFFICULTY_LEVELS } from '../../utils/constants.js';

const defaultForm = {
  scenarioType: SCENARIO_TYPES[0],
  targetContext: TARGET_CONTEXTS[0],
  difficulty: DIFFICULTY_LEVELS[0],
};

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative mt-0.5">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="select-field pl-3.5 pr-7 py-2.5 text-sm font-medium w-full"
        >
          {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg className="w-4 h-4 text-tx-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function SimulationForm({ onGenerate, loading, disabled = false }) {
  const [form, setForm] = useState(defaultForm);
  const update = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center">
          <FlaskConical className="w-3.5 h-3.5 text-brand" />
        </div>
        <h2 className="font-semibold text-tx-primary">Configure Training Scenario</h2>
      </div>

      <div className="space-y-4">
        <SelectField label="Scenario Type" value={form.scenarioType} onChange={update('scenarioType')} options={SCENARIO_TYPES} />
        <SelectField label="Target Context" value={form.targetContext} onChange={update('targetContext')} options={TARGET_CONTEXTS} />
        <SelectField label="Difficulty" value={form.difficulty} onChange={update('difficulty')} options={DIFFICULTY_LEVELS} />
      </div>

      <Button onClick={() => onGenerate(form)} loading={loading} disabled={loading || disabled} className="w-full justify-center py-3 font-semibold">
        <FlaskConical className="w-4 h-4" />
        {loading ? 'Generating Scenario…' : 'Generate Training Scenario'}
      </Button>
    </div>
  );
}
