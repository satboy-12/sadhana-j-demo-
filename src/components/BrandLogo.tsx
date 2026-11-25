import React, { useState } from 'react';

export type BrandLogoVariant = 'symbol' | 'horizontal' | 'wordmark' | 'full';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  className?: string;
  showSweep?: boolean;
  alt?: string;
  surface?: 'dark' | 'light' | 'bare';
}

const ASSET_MAP: Record<
  BrandLogoVariant,
  { src: string; width: number; height: number; aspectClass: string }
> = {
  symbol: {
    src: '/assets/brand/brand-symbol.png',
    width: 512,
    height: 512,
    aspectClass: 'aspect-square',
  },
  horizontal: {
    src: '/assets/brand/brand-horizontal.png',
    width: 1220,
    height: 240,
    aspectClass: 'aspect-[1220/240]',
  },
  wordmark: {
    src: '/assets/brand/brand-wordmark.png',
    width: 960,
    height: 212,
    aspectClass: 'aspect-[960/212]',
  },
  full: {
    src: '/assets/brand/her-health-journey-logo.png',
    width: 1672,
    height: 941,
    aspectClass: 'aspect-[1672/941]',
  },
};

/**
 * Official Her Health Journey brand asset component.
 * Renders crisp variant-appropriate assets (circular symbol, horizontal lockup, wordmark, or full emblem)
 * with explicit dimensions, object-contain proportion lock, and zero clipping or blur.
 */
export function BrandLogo({
  variant = 'symbol',
  className = 'h-10',
  showSweep = false,
  alt = 'Her Health Journey Official Logo',
  surface = 'bare',
}: BrandLogoProps) {
  const [imageError, setImageError] = useState(false);
  const asset = ASSET_MAP[variant];

  const surfaceStyles =
    surface === 'bare'
      ? 'bg-transparent'
      : variant === 'symbol'
      ? surface === 'light'
        ? 'rounded-full shadow-[0_6px_18px_rgba(9,40,32,0.16)]'
        : 'rounded-full shadow-[0_4px_14px_rgba(9,40,32,0.28)]'
      : surface === 'light'
      ? 'rounded-[12px] px-2 py-1 bg-[#092820] border border-[#C5A66B]/45 shadow-[0_6px_18px_rgba(9,40,32,0.18)]'
      : 'rounded-[10px] px-1.5 py-0.5 bg-[#092820]/90 border border-[#C5A66B]/30 shadow-[0_4px_14px_rgba(9,40,32,0.25)]';

  return (
    <span
      className={`${className} ${asset.aspectClass} relative inline-flex items-center justify-center shrink-0 overflow-hidden ${surfaceStyles}`}
    >
      {showSweep && (
        <span
          className="hhj-logo-sweep pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-[#E4D2A5]/45 to-transparent z-20"
          aria-hidden="true"
        />
      )}

      {!imageError ? (
        <img
          src={asset.src}
          width={asset.width}
          height={asset.height}
          alt={alt}
          className="w-full h-full object-contain relative z-10 select-none"
          onError={() => setImageError(true)}
          loading="eager"
          decoding="async"
        />
      ) : (
        <span className="relative z-10 px-2 font-display font-bold text-xs tracking-wider text-[#E4D2A5] uppercase whitespace-nowrap">
          Her Health Journey
        </span>
      )}
    </span>
  );
}
