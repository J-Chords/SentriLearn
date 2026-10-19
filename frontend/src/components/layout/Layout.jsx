// =============================================
// LAYOUT — RESPONSIVE SIDEBAR + TOPBAR
// =============================================
import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, GraduationCap, ClipboardCheck, FlaskConical,
  TrendingUp, Target, Flag, BarChart3, ShieldCheck, Inbox, Users,
  Sun, Moon, Menu, X, ChevronDown, LogOut, UserCircle2,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_SECTIONS = [
  {
    label: 'Learning',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { path: '/training', label: 'Training Modules', icon: GraduationCap, end: false },
      { path: '/assessments', label: 'Assessments', icon: ClipboardCheck, end: false },
      { path: '/simulation', label: 'Phishing Simulation Lab', icon: FlaskConical, end: false },
      { path: '/progress', label: 'My Progress', icon: TrendingUp, end: false },
    ],
  },
  {
    label: 'Awareness',
    items: [
      { path: '/campaigns', label: 'Simulation Campaigns', icon: Target, end: false },
      { path: '/report', label: 'Report Phishing', icon: Flag, end: false },
    ],
  },
  {
    label: 'Admin',
    adminOnly: true,
    items: [
      { path: '/admin', label: 'Admin Analytics', icon: BarChart3, end: false },
      { path: '/admin/users', label: 'Learner Accounts', icon: Users, end: false },
      { path: '/admin/reports', label: 'Report Review', icon: Inbox, end: false },
    ],
  },
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="p-2 rounded-lg text-tx-secondary hover:text-tx-primary hover:bg-surface-overlay transition-all duration-200"
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand" />}
    </button>
  );
}

function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-surface-overlay border border-transparent hover:border-surface-border transition-all"
      >
        <div className="w-7 h-7 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
          <UserCircle2 className="w-4.5 h-4.5" />
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-xs font-semibold text-tx-primary leading-none">{user.name}</div>
          <div className="text-[10px] text-tx-muted leading-none mt-0.5">{user.title}</div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-tx-muted" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-raised border border-surface-border shadow-card-hover overflow-hidden animate-fade-in z-50">
          <div className="px-4 py-3 border-b border-surface-border">
            <p className="text-xs font-semibold text-tx-primary">{user.name}</p>
            <p className="text-[11px] text-tx-muted mt-0.5">{user.email}</p>
            {user.isDemoAccount && (
              <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wide text-brand bg-brand/10 border border-brand/20 px-1.5 py-0.5 rounded">
                Demo account
              </span>
            )}
          </div>
          <button
            onClick={async () => { setOpen(false); await logout(); navigate('/login'); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-severity-critical hover:bg-severity-critical/[0.08] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function SidebarContent({ onNavClick }) {
  const { user } = useAuth();
  const sections = NAV_SECTIONS.filter((s) => !s.adminOnly || user?.role === 'admin');

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shadow-sm shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-base text-tx-primary tracking-tight">SentriLearn</div>
            <div className="text-[10px] text-tx-muted font-mono tracking-wider">AWARENESS PLATFORM</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-bold text-tx-muted uppercase tracking-widest px-3 pb-2">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={onNavClick}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate text-sm">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Compliance footer */}
      <div className="px-4 py-4 border-t border-surface-border">
        <p className="text-[10px] text-tx-muted leading-relaxed">
          SentriLearn is an educational cybersecurity awareness platform. Simulated content is for training purposes only.
        </p>
      </div>
    </div>
  );
}

function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col h-screen sticky top-0 bg-surface-raised border-r border-surface-border">
      <SidebarContent />
    </aside>
  );
}

function MobileDrawer({ open, onClose }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-surface-raised border-r border-surface-border shadow-card-hover animate-slide-in lg:hidden">
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-tx-secondary hover:text-tx-primary hover:bg-surface-overlay transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <SidebarContent onNavClick={onClose} />
      </div>
    </>
  );
}

function TopBar({ onMenuClick }) {
  const location = useLocation();
  const { user } = useAuth();
  const allItems = NAV_SECTIONS.flatMap((s) => s.items);
  const currentNav = allItems.find((n) =>
    n.end ? location.pathname === n.path : location.pathname.startsWith(n.path)
  );

  return (
    <header className="sticky top-0 z-30 bg-surface-raised/90 backdrop-blur-md border-b border-surface-border">
      <div className="flex items-center gap-3 px-4 h-14">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-1 rounded-lg text-tx-secondary hover:text-tx-primary hover:bg-surface-overlay transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-tx-primary">SentriLearn</span>
        </div>

        {currentNav && (
          <div className="hidden lg:flex items-center gap-2">
            <currentNav.icon className="w-4 h-4 text-brand" />
            <span className="font-semibold text-sm text-tx-primary">{currentNav.label}</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {user && <ProfileMenu />}
        </div>
      </div>
    </header>
  );
}

function MobileBottomNav() {
  const { user } = useAuth();
  const items = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { path: '/training', label: 'Training', icon: GraduationCap },
    { path: '/simulation', label: 'Simulate', icon: FlaskConical },
    { path: '/progress', label: 'Progress', icon: TrendingUp },
    user?.role === 'admin'
      ? { path: '/admin', label: 'Admin', icon: BarChart3 }
      : { path: '/report', label: 'Report', icon: Flag },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface-raised/95 backdrop-blur-md border-t border-surface-border">
      <div className="flex">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-2.5 px-1 text-center transition-all duration-200 ${
                isActive ? 'text-brand' : 'text-tx-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-brand/10' : ''}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <DesktopSidebar />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-8">
            {children}
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
