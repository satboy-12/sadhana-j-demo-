import React, { useCallback, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  Activity,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Droplets,
  RotateCcw,
  ShieldCheck,
  Smile,
  Utensils,
} from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { CinematicIntro } from '../components/CinematicIntro';
import { CycleWheel } from '../components/CycleWheel';
import { ModuleCard } from '../components/ModuleCard';
import { NavigationBar } from '../components/NavigationBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { useAuth } from '../context/AuthContext';
import {
  clearIntroCompleted,
  markIntroCompleted,
  shouldShowCinematicIntro,
} from '../utils/introStorage';

const TRACKERS = [
  {
    title: 'Cycle calendar',
    description:
      'Log periods, review cycle history, and view predicted periods and estimated fertile windows on one calendar.',
    path: '/period-tracker',
    icon: CalendarDays,
    accentColor: 'var(--module-period)',
    accentBg: 'var(--men-soft)',
    accentInk: 'var(--men-ink)',
  },
  {
    title: 'PCOS symptoms',
    description:
      'Daily symptom, severity, pelvic pain, and energy logs with a 30-day trend and clinician-ready summary.',
    path: '/pcos-tracker',
    icon: Activity,
    accentColor: 'var(--module-symptoms)',
    accentBg: 'var(--fol-soft)',
    accentInk: 'var(--fol-ink)',
  },
  {
    title: 'Mood & wellness',
    description:
      'Track daily mood check-ins, sleep hours, sleep quality, stress index, and see how rest and mood move together.',
    path: '/wellness',
    icon: Smile,
    accentColor: 'var(--module-wellness)',
    accentBg: 'var(--ovu-soft)',
    accentInk: 'var(--ovu-ink)',
  },
  {
    title: 'Nutrition',
    description:
      'Log breakfast, lunch, dinner, and snacks with calories and macros alongside hormone-supportive guidance.',
    path: '/nutrition',
    icon: Utensils,
    accentColor: 'var(--module-nutrition)',
    accentBg: 'var(--lut-soft)',
    accentInk: 'var(--lut-ink)',
  },
  {
    title: 'Water',
    description:
      'One-tap hydration logging, customizable daily ml targets, reminder preferences, and 7-day history.',
    path: '/water',
    icon: Droplets,
    accentColor: 'var(--module-water)',
    accentBg: 'var(--water-soft)',
    accentInk: 'var(--water-ink)',
  },
  {
    title: 'Journal',
    description:
      'Private health reflections with tags, keyword search, daily prompts, and full create, edit, and delete controls.',
    path: '/journal',
    icon: BookOpen,
    accentColor: 'var(--module-journal)',
    accentBg: 'var(--journal-soft)',
    accentInk: 'var(--journal-ink)',
  },
];

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const autostartBypass = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('autostart') === '1';
  }, [location.search]);

  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return shouldShowCinematicIntro({ autostartBypass });
  });

  const [heroImageFailed, setHeroImageFailed] = useState(false);

  const handleIntroComplete = useCallback(() => {
    markIntroCompleted();
    setShowIntro(false);
  }, []);

  const handleReplayIntro = () => {
    if (typeof window !== 'undefined') {
      clearIntroCompleted();
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
    setShowIntro(true);
  };

  const handleExploreModule = (path: string) => {
    if (isAuthenticated) {
      navigate(path);
      return;
    }
    navigate('/login', { state: { from: { pathname: path } } });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      {showIntro && <CinematicIntro onComplete={handleIntroComplete} />}

      <div className="pt-4 sm:pt-6 pb-14 lg:pb-16">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: showIntro ? 0 : 1, y: showIntro ? 10 : 0 }}
          animate={{ opacity: showIntro ? 0 : 1, y: showIntro ? 10 : 0 }}
          transition={{ duration: prefersReducedMotion ? 0.05 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="page-container flex flex-col gap-12 md:gap-16 lg:gap-[72px]"
        >
          <NavigationBar isAuthenticated={isAuthenticated} />

          {/* Main Hero Reveal */}
          <section className="grid grid-cols-1 lg:grid-cols-[1.06fr_0.94fr] gap-8 lg:gap-12 items-center">
            <div>
              <p className="hhj-eyebrow">Know Your Body. Own Your Journey.</p>
              <h1 className="font-display font-bold text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.06] tracking-tight mt-2.5 text-balance text-[var(--ink)]">
                Your wellness journey{' '}
                <em className="not-italic hhj-grad-text">deserves precision and care.</em>
              </h1>
              <p className="text-[1.04rem] sm:text-[1.1rem] text-[var(--muted)] max-w-[48ch] mt-[18px] mb-[26px] leading-relaxed">
                Understand your cycle, log PCOS patterns, balance mood, nutrition, hydration, and private notes—all grounded cleanly in your personal Firebase health vault.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <PrimaryButton to={isAuthenticated ? '/dashboard' : '/register'}>
                  <span>{isAuthenticated ? 'Open Dashboard' : 'Begin Your Journey'}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </PrimaryButton>
                {!isAuthenticated && (
                  <SecondaryButton to="/login" variant="outline">
                    Sign In
                  </SecondaryButton>
                )}
              </div>
            </div>

            {/* Editorial Natural Photo + Cycle Wheel Preview Card */}
            <div className="hhj-card p-4 sm:p-5 flex flex-col gap-4">
              <div className="relative overflow-hidden rounded-[14px] aspect-[4/3] bg-[var(--surface2)]">
                {!heroImageFailed ? (
                  <img
                    src="/src/assets/images/wellness_hero_editorial_1795442267179.jpg"
                    alt="Warm linen wellness journal beside herbal tea and botanical petals on sunlit stone"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImageFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center p-6 text-center bg-[#092820]">
                    <BrandLogo variant="full" className="w-56" surface="bare" />
                  </div>
                )}

                {/* Cycle overview card anchored at corner */}
                <div className="absolute right-3 bottom-3 sm:right-4 sm:bottom-4 bg-[var(--surface)]/95 border border-[var(--border-strong)] rounded-[16px] p-3 sm:p-3.5 shadow-[0_10px_28px_rgba(9,40,32,0.18)] flex items-center gap-3 max-w-[274px]">
                  <CycleWheel
                    averageCycle={28}
                    periodLength={5}
                    ovulationDay={14}
                    currentDay={14}
                    phaseLabel="Ovulation"
                    phaseColor="var(--ovu-ink)"
                    smallLabel="Day"
                    sizeClass="w-[80px] sm:w-[90px]"
                  />
                  <div className="min-w-0 pr-1">
                    <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[var(--brand-jade)]">
                      Cycle Rhythm
                    </p>
                    <p className="text-xs sm:text-sm font-display font-bold text-[var(--ink)] leading-snug">
                      Pattern Clarity
                    </p>
                    <p className="text-[0.72rem] text-[var(--muted)] leading-snug mt-0.5">
                      Synced across Web &amp; Android via Firebase.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs font-semibold text-[var(--muted)]">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 text-[var(--ink)]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[var(--c-men)]" aria-hidden="true" />
                    Menstrual
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[var(--ink)]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[var(--c-fol)]" aria-hidden="true" />
                    Follicular
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[var(--ink)]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[var(--c-ovu)]" aria-hidden="true" />
                    Ovulation
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[var(--ink)]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[var(--c-lut)]" aria-hidden="true" />
                    Luteal
                  </span>
                </div>
                <span>Real Firebase-backed tracking</span>
              </div>
            </div>
          </section>

          {/* Six Trackers */}
          <section id="trackers">
            <div className="mb-5">
              <p className="hhj-eyebrow">Six core modules</p>
              <h2 className="font-display font-bold text-2xl sm:text-[1.75rem] text-[var(--ink)] mt-1">
                Everything in one calm wellness suite
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {TRACKERS.map((item) => (
                <ModuleCard
                  key={item.title}
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  accentColor={item.accentColor}
                  accentBg={item.accentBg}
                  accentInk={item.accentInk}
                  onOpen={() => handleExploreModule(item.path)}
                />
              ))}
            </div>
          </section>

          {/* Privacy & Ownership */}
          <section id="privacy" className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <p className="hhj-eyebrow">Privacy &amp; Ownership</p>
              <h2 className="font-display font-bold text-[1.9rem] text-[var(--ink)] mt-1 text-balance">
                Your health records belong strictly to you
              </h2>
              <p className="text-[var(--muted)] mt-3 leading-relaxed">
                Health logs are deeply personal. Sign in with Google or your email and password for strict per-user Firebase Authentication and Cloud Firestore isolation across both web and Android.
              </p>
              <div className="mt-5">
                <Link
                  to={isAuthenticated ? '/dashboard' : '/login'}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--plum)] hover:underline"
                >
                  <ShieldCheck className="w-4 h-4 text-[var(--brand-jade)]" aria-hidden="true" />
                  <span>{isAuthenticated ? 'Go to Dashboard' : 'Sign in to access your records'}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <ul className="space-y-4 hhj-card p-6">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[var(--good)] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <b className="text-[var(--ink)]">Verified owner isolation.</b>
                  <p className="text-[var(--muted)] text-sm mt-0.5">
                    Firebase Authentication and strict Cloud Firestore security rules isolate every record strictly to your account.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[var(--good)] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <b className="text-[var(--ink)]">Zero fabricated records.</b>
                  <p className="text-[var(--muted)] text-sm mt-0.5">
                    Every cycle estimate, chart, and summary renders straight from your real logged entries.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[var(--good)] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <b className="text-[var(--ink)]">Export or delete any time.</b>
                  <p className="text-[var(--muted)] text-sm mt-0.5">
                    Download your profile record as JSON or permanently delete your account from Profile settings.
                  </p>
                </div>
              </li>
            </ul>
          </section>

          {/* Two Clinical Disclaimer Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="hhj-card-flat p-5 lg:p-6">
              <h3 className="font-display font-bold text-[1.08rem] text-[var(--ink)]">
                How predictions work
              </h3>
              <p className="text-[var(--muted)] mt-2 text-[0.95rem] leading-relaxed">
                Your average cycle is computed from your logged cycle start dates. Ovulation is estimated 14 days before the next expected period, with the fertile window spanning days leading up to ovulation.
              </p>
            </div>
            <div className="hhj-card-flat p-5 lg:p-6">
              <h3 className="font-display font-bold text-[1.08rem] text-[var(--ink)]">
                A tracking aid, not a doctor
              </h3>
              <p className="text-[var(--muted)] mt-2 text-[0.95rem] leading-relaxed">
                Predictions are approximate estimates and must not be used as contraception. This platform does not diagnose or treat any condition. Consult a clinician about symptoms that concern you.
              </p>
            </div>
          </section>

          {/* Emerald + Champagne Gold CTA Band */}
          <section className="hhj-grad text-white rounded-[22px] border border-[#C5A66B]/30 px-6 sm:px-9 py-10 sm:py-11 flex flex-col items-start gap-4 shadow-[0_18px_40px_rgba(9,40,32,0.22)]">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#E4D2A5]">
              Know Your Body. Own Your Journey.
            </p>
            <h2 className="font-display font-bold text-[1.85rem] sm:text-[2.1rem] text-white">
              Ready when you are
            </h2>
            <p className="max-w-[48ch] text-[#B9D2C5] leading-relaxed">
              Create an account or sign in with Google or email and password to sync your six wellness tracking modules with Cloud Firestore.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <SecondaryButton
                to={isAuthenticated ? '/dashboard' : '/register'}
                variant="gold"
              >
                <span>{isAuthenticated ? 'Open Dashboard' : 'Begin Your Journey'}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </SecondaryButton>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center min-h-[42px] px-5 py-2.5 rounded-[12px] border border-white/35 text-white font-semibold text-sm hover:bg-white/10 transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
              )}
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-[var(--line)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)]">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 font-display font-bold text-[var(--ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-champagne)] rounded-lg"
              >
                <BrandLogo variant="symbol" className="w-9 h-9" surface="light" />
                <span>Her Health Journey</span>
              </Link>
              <span aria-hidden="true" className="hidden sm:inline text-[var(--border-strong)]">
                ·
              </span>
              <p>&copy; {new Date().getFullYear()} Her Health Journey. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={handleReplayIntro}
                className="inline-flex items-center gap-1 hover:text-[var(--ink)] cursor-pointer font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Replay intro</span>
              </button>
              <Link to="/login" className="hover:text-[var(--ink)] font-medium">
                Sign In
              </Link>
              <Link to="/register" className="hover:text-[var(--ink)] font-medium">
                Create Account
              </Link>
              <a href="#privacy" className="hover:text-[var(--ink)] font-medium">
                Privacy
              </a>
            </div>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
