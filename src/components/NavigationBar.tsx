import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';

interface NavigationBarProps {
  isAuthenticated?: boolean;
  activeSection?: 'trackers' | 'privacy';
}

/**
 * Emerald Green (#103C32) Website Navigation Bar following 3-zone structure:
 * [BrandLogo + Title] — [Nav Links] — [Sign In + Primary Action]
 */
export function NavigationBar({ isAuthenticated = false, activeSection }: NavigationBarProps) {
  return (
    <header
      className="rounded-[18px] px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sm:gap-8 border border-[#C5A66B]/25 shadow-[0_8px_28px_rgba(16,60,50,0.12)]"
      style={{ backgroundColor: 'var(--nav-background)', color: 'var(--nav-text)' }}
    >
      {/* Zone 1: Brand Title */}
      <Link
        to="/"
        className="flex items-center gap-2.5 font-display font-bold text-white leading-[1.1] shrink-0 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A66B] rounded-xl"
      >
        <BrandLogo variant="symbol" className="w-9 h-9 sm:w-10 sm:h-10" surface="dark" />
        <span className="text-[0.95rem] sm:text-base tracking-tight">Her Health Journey</span>
      </Link>

      {/* Zone 2: Concise single-line navigation links */}
      <nav aria-label="Primary sections" className="hidden md:flex items-center gap-6 shrink-0">
        <a
          href="#trackers"
          className={`text-sm font-semibold transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeSection === 'trackers'
              ? 'text-[#C5A66B] border-[#C5A66B]'
              : 'text-white/85 border-transparent hover:text-[#E4D2A5] hover:border-[#C5A66B]/60'
          }`}
        >
          Six Trackers
        </a>
        <a
          href="#privacy"
          className={`text-sm font-semibold transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeSection === 'privacy'
              ? 'text-[#C5A66B] border-[#C5A66B]'
              : 'text-white/85 border-transparent hover:text-[#E4D2A5] hover:border-[#C5A66B]/60'
          }`}
        >
          Privacy &amp; Sync
        </a>
        <Link
          to="/login"
          className="text-sm font-semibold text-white/85 hover:text-[#E4D2A5] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 border-transparent hover:border-[#C5A66B]/60"
        >
          Sign In
        </Link>
      </nav>

      {/* Zone 3: Primary CTA Action */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          to="/login"
          className="md:hidden inline-flex items-center justify-center min-h-[38px] px-3 py-1.5 rounded-[12px] border border-[#C5A66B]/45 text-white text-xs font-semibold hover:bg-[#174F40] transition-colors whitespace-nowrap shrink-0"
        >
          Sign In
        </Link>
        <Link
          to={isAuthenticated ? '/dashboard' : '/register'}
          className="secondary-button inline-flex items-center justify-center min-h-[38px] sm:min-h-[40px] px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span className="sm:hidden">{isAuthenticated ? 'Dashboard' : 'Start'}</span>
          <span className="hidden sm:inline">
            {isAuthenticated ? 'Open Dashboard' : 'Begin Journey'}
          </span>
        </Link>
      </div>
    </header>
  );
}
