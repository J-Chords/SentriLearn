// =============================================
// STRING → ICON COMPONENT MAP
// Lets data files reference icons by name without importing JSX.
// =============================================
import {
  ShieldCheck, Mail, KeyRound, Users, Globe, Inbox,
  CheckCircle2, Eye, BookOpen, Flag, ClipboardCheck, Target,
} from 'lucide-react';

export const ICON_MAP = {
  ShieldCheck, Mail, KeyRound, Users, Globe, Inbox,
  CheckCircle2, Eye, BookOpen, Flag, ClipboardCheck, Target,
};

export function resolveIcon(name) {
  return ICON_MAP[name] || ShieldCheck;
}
