// =============================================
// SAFE EMAIL BODY RENDERER
//
// Renders message content as inert text — never dangerouslySetInnerHTML.
// [LINK] / [ATTACHMENT] placeholders are highlighted but are plain
// <span> elements with no href/navigation, per the platform's safety
// boundaries (no active links, no executable markup).
// =============================================
const SPLIT_PATTERN = /(\[(?:LINK|MALICIOUS_LINK|ATTACHMENT[^\]]*)\])/g;
const MATCH_PATTERN = /^\[(?:LINK|MALICIOUS_LINK|ATTACHMENT[^\]]*)\]$/;

export function SafeEmailBody({ text }) {
  const parts = (text || '').split(SPLIT_PATTERN);

  return (
    <div className="text-sm text-tx-secondary leading-relaxed font-mono bg-surface-raised border border-surface-border rounded-lg p-4 max-h-80 overflow-y-auto whitespace-pre-wrap">
      {parts.map((part, i) =>
        MATCH_PATTERN.test(part) ? (
          <span key={i} className="text-brand underline cursor-not-allowed" title="Inert placeholder — not a real link">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </div>
  );
}
