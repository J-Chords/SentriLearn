// =============================================
// REVIEWED SCENARIO EMAIL PREVIEW
//
// Simpler than EmailPreview — no severity/red-flag display, since
// ground truth is only revealed by the backend AFTER a decision is
// submitted (see Simulation.jsx ReviewedPracticePanel).
// =============================================
import { Clock } from 'lucide-react';
import { SafeEmailBody } from './SafeEmailBody.jsx';
import { formatDate } from '../../utils/helpers.js';

export function ReviewedScenarioPreview({ scenario }) {
  if (!scenario) return null;

  return (
    <div className="card overflow-hidden">
      <div className="bg-surface-overlay border-b border-surface-border px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-severity-critical/60" />
          <div className="w-3 h-3 rounded-full bg-severity-medium/60" />
          <div className="w-3 h-3 rounded-full bg-severity-low/60" />
        </div>
        <div className="flex-1 mx-3 bg-surface border border-surface-border rounded-md px-3 py-1 text-xs text-tx-muted font-mono truncate">
          {scenario.senderEmail}
        </div>
      </div>

      <div className="p-4 border-b border-surface-border space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-surface-overlay border border-surface-border flex items-center justify-center text-sm font-bold text-tx-muted shrink-0 mt-0.5">
            {scenario.senderName?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-sm text-tx-primary">{scenario.senderName}</span>
            <div className="text-xs text-tx-muted font-mono mt-0.5 truncate">&lt;{scenario.senderEmail}&gt;</div>
          </div>
          <div className="text-xs text-tx-muted shrink-0 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {formatDate(new Date().toISOString())}
          </div>
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-tx-muted w-14 shrink-0 font-medium">To:</span>
            <span className="text-tx-secondary text-xs">you@sentrilearn-university.edu</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-tx-muted w-14 shrink-0 font-medium">Subject:</span>
            <span className="font-semibold text-tx-primary">{scenario.subject}</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-surface">
        <SafeEmailBody text={scenario.body} />
      </div>
    </div>
  );
}
