// =============================================
// STRING → ICON COMPONENT MAP
// Lets data files reference icons by name without importing JSX.
// =============================================
import {
  ShieldCheck, Mail, KeyRound, Users, Globe, Inbox,
  CheckCircle2, Eye, BookOpen, Flag, ClipboardCheck, Target,
  LogIn, LogOut, FlaskConical, UserCog,
} from 'lucide-react';

export const ICON_MAP = {
  ShieldCheck, Mail, KeyRound, Users, Globe, Inbox,
  CheckCircle2, Eye, BookOpen, Flag, ClipboardCheck, Target,
};

export function resolveIcon(name) {
  return ICON_MAP[name] || ShieldCheck;
}

const ACTIVITY_ICON_MAP = {
  'auth.login': LogIn,
  'auth.logout': LogOut,
  'training.lesson_completed': BookOpen,
  'training.module_completed': ShieldCheck,
  'assessment.submitted': ClipboardCheck,
  'practice.checked': Eye,
  'practice.reported': Flag,
  'report.submitted': Flag,
  'campaign.activated': Target,
  'campaign.completed': Target,
  'campaign.archived': Target,
  'report.reviewed': Inbox,
  'admin.user_created': UserCog,
  'admin.user_status_changed': UserCog,
};

export function resolveActivityIcon(type) {
  return ACTIVITY_ICON_MAP[type] || FlaskConical;
}
