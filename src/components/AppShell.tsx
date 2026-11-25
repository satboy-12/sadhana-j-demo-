import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  Bell,
  BookOpen,
  CalendarDays,
  Droplets,
  LayoutGrid,
  Lock,
  LogOut,
  MoreHorizontal,
  Smile,
  User,
  UserCircle,
  Utensils,
  X,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Today', icon: LayoutGrid, accent: '#C5A66B' },
  { to: '/period-tracker', label: 'Cycle', icon: CalendarDays, accent: '#E58B91' },
  { to: '/pcos-tracker', label: 'PCOS', icon: Activity, accent: '#B49AD8' },
  { to: '/wellness', label: 'Mood & Wellness', icon: Smile, accent: '#A8BCA4' },
  { to: '/nutrition', label: 'Nutrition', icon: Utensils, accent: '#D8AA65' },
  { to: '/water', label: 'Water', icon: Droplets, accent: '#70B8C8' },
  { to: '/journal', label: 'Journal', icon: BookOpen, accent: '#D4B98A' },
  { to: '/profile', label: 'Profile', icon: UserCircle, accent: '#E4D2A5' },
];

const MOBILE_PRIMARY_TABS = [
  { to: '/dashboard', label: 'Today', icon: LayoutGrid },
  { to: '/period-tracker', label: 'Cycle', icon: CalendarDays },
  { to: '/wellness', label: 'Mood', icon: Smile },
  { to: '/journal', label: 'Journal', icon: BookOpen },
];

const MOBILE_SHEET_ITEMS = NAV_ITEMS.filter(
  (item) => !MOBILE_PRIMARY_TABS.some((tab) => tab.to === item.to),
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);

  const handleSignOut = async () => {
    setMoreSheetOpen(false);
    await logout();
    navigate('/login');
  };

  const inMoreRoute = MOBILE_SHEET_ITEMS.some((i) => i.to === location.pathname);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <div className="hhj-shell py-4 lg:py-6 pb-24 lg:pb-12">
        <div className="page-container grid grid-cols-1 lg:grid-cols-[224px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)] gap-6 items-start">
          {/* Desktop Emerald Navigation Sidebar */}
          <aside
            aria-label="Primary Sidebar Navigation"
            className="hidden lg:flex sticky top-5 h-[calc(100dvh-40px)] flex-col gap-[18px] px-[14px] py-5 rounded-[18px] border border-[#C5A66B]/25 shadow-[0_12px_32px_rgba(9,40,32,0.18)]"
            style={{ backgroundColor: 'var(--nav-background)', color: 'var(--nav-text)' }}
          >
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 px-2 text-white font-display font-bold leading-[1.15] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A66B] rounded-xl"
            >
              <BrandLogo variant="symbol" className="w-9 h-9" surface="dark" />
              <span className="tracking-tight text-sm leading-tight">
                Her Health{' '}
                <br />
                Journey
              </span>
            </Link>

            <nav className="flex flex-col gap-1 flex-1 overflow-y-auto" aria-label="Main">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-[12px] font-semibold text-[0.92rem] transition-colors whitespace-nowrap ${
                        isActive
                          ? 'bg-[#174F40] text-[#E4D2A5] border border-[#C5A66B]/40'
                          : 'text-white/80 hover:bg-[#174F40]/65 hover:text-white border border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className="w-5 h-5 shrink-0"
                          style={{ color: isActive ? item.accent : undefined }}
                          aria-hidden="true"
                        />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="mt-auto space-y-3 pt-3 border-t border-white/15">
              <p className="text-[0.76rem] text-[#B9D2C5] flex gap-2 px-2 items-start leading-snug">
                <Lock className="w-4 h-4 shrink-0 mt-0.5 text-[#C5A66B]" aria-hidden="true" />
                <span>
                  {user
                    ? `Signed in (${user.fullName}). Cloud Firestore active.`
                    : 'Firebase Authentication required.'}
                </span>
              </p>

              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-[12px] text-[0.9rem] font-semibold text-white/85 hover:bg-[#174F40] hover:text-[#E4D2A5] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Main Workspace Column */}
          <div className="min-w-0 flex flex-col gap-5">
            {/* Mobile Topbar + Desktop subtle utility row */}
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/dashboard"
                className="lg:hidden flex items-center gap-2.5 font-display font-bold text-[var(--ink)]"
              >
                <BrandLogo variant="symbol" className="w-8 h-8" surface="light" />
                <span>Her Health Journey</span>
              </Link>

              <span className="hidden lg:block" />

              <div className="flex items-center gap-2 ml-auto relative">
                <button
                  type="button"
                  aria-label="Firebase connection and account overview"
                  aria-expanded={statusPopoverOpen}
                  onClick={() => setStatusPopoverOpen((prev) => !prev)}
                  className="w-9 h-9 rounded-[12px] border border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] inline-flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Bell className="w-4 h-4" aria-hidden="true" />
                </button>

                <Link
                  to="/profile"
                  aria-label="Open profile settings"
                  className="w-9 h-9 rounded-[12px] bg-[var(--button-primary)] text-[var(--button-primary-text)] flex items-center justify-center hover:bg-[var(--button-primary-hover)] transition-colors"
                >
                  <User className="w-4 h-4" aria-hidden="true" />
                </Link>

                {statusPopoverOpen && (
                  <div
                    role="region"
                    aria-label="Firebase integration status"
                    className="absolute right-0 top-11 w-80 max-w-[calc(100vw-32px)] hhj-card p-4 z-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-[var(--ink)]">
                        Firebase Session Status
                      </span>
                      <button
                        type="button"
                        aria-label="Close status popover"
                        onClick={() => setStatusPopoverOpen(false)}
                        className="p-1 rounded-lg hover:bg-[var(--surface2)] text-[var(--muted)] cursor-pointer"
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="text-xs text-[var(--muted)] space-y-2">
                      <p>
                        <span className="font-semibold text-[var(--ink)]">Account:</span>{' '}
                        {user ? `${user.email}` : 'Signed out'}
                      </p>
                      <p className="break-all">
                        <span className="font-semibold text-[var(--ink)]">Database:</span>{' '}
                        <code className="font-mono text-[var(--plum)]">
                          Cloud Firestore (Owner-Isolated)
                        </code>
                      </p>
                      <div className="pt-2 border-t border-[var(--line)] flex justify-between items-center">
                        <Link
                          to="/profile"
                          onClick={() => setStatusPopoverOpen(false)}
                          className="text-[var(--plum)] font-semibold hover:underline"
                        >
                          Manage Preferences
                        </Link>
                        <button
                          type="button"
                          onClick={() => void handleSignOut()}
                          className="text-[var(--muted)] hover:text-[var(--ink)] font-semibold cursor-pointer"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <main className="min-w-0 flex flex-col gap-5 sm:gap-6">{children}</main>
          </div>
        </div>
      </div>

      {/* Mobile "More" Slide-Up Sheet */}
      {moreSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-30">
          <div
            className="fixed inset-0 bg-black/45"
            onClick={() => setMoreSheetOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-label="More health modules"
            className="fixed left-0 right-0 bottom-0 z-35 bg-[var(--surface)] border-t border-[var(--border-strong)] rounded-t-[20px] p-4 pb-[88px] shadow-[0_-12px_40px_rgba(9,40,32,0.22)]"
          >
            <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-[var(--line)]">
              <span className="font-display font-bold text-sm text-[var(--ink)]">More Modules</span>
              <button
                type="button"
                aria-label="Close more modules menu"
                onClick={() => setMoreSheetOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--surface2)] text-[var(--muted)] cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="More" className="flex flex-col gap-1">
              {MOBILE_SHEET_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMoreSheetOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-[12px] font-semibold transition-colors ${
                        isActive
                          ? 'bg-[var(--surface2)] text-[var(--plum)]'
                          : 'text-[var(--muted)] hover:bg-[var(--surface2)] hover:text-[var(--ink)]'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] font-semibold text-[var(--muted)] hover:bg-[var(--surface2)] hover:text-[var(--ink)] cursor-pointer text-left"
              >
                <LogOut className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Emerald Bottom Tab Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed left-0 right-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#C5A66B]/25 px-3 py-1.5"
        style={{ backgroundColor: 'var(--nav-background)', color: 'var(--nav-text)' }}
      >
        {MOBILE_PRIMARY_TABS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMoreSheetOpen(false)}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-[10px] text-[0.7rem] font-semibold transition-colors ${
                  isActive ? 'text-[#C5A66B]' : 'text-white/75 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
        <button
          type="button"
          aria-expanded={moreSheetOpen}
          onClick={() => setMoreSheetOpen((prev) => !prev)}
          className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-[10px] text-[0.7rem] font-semibold cursor-pointer ${
            moreSheetOpen || inMoreRoute ? 'text-[#C5A66B]' : 'text-white/75 hover:text-white'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
