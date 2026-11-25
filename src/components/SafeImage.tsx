import React, { useState } from 'react';
import { HeartHandshake } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function SafeImage({ src, alt, className = '', fallbackLabel }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-primary-fixed/60 via-surface-container-low to-secondary-fixed/50 text-on-surface-variant p-4 ${className}`}
      >
        <HeartHandshake className="w-7 h-7 text-primary mb-2" aria-hidden="true" />
        {fallbackLabel && (
          <span className="text-xs font-medium text-center text-on-surface-variant">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
