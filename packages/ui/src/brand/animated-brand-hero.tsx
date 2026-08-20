'use client';

import { useEffect, useRef, useState } from 'react';

import { BrandMark } from './brand-mark.js';

export interface AnimatedBrandHeroProps {
  readonly className?: string;
  readonly mp4Src?: string;
  readonly posterSrc?: string;
  readonly webmSrc?: string;
}

/**
 * Future-safe hero boundary. With no approved motion asset it stays a static,
 * vector ribbon. When sources are supplied, it waits for viewport visibility,
 * and never starts non-essential motion for reduced-motion or Save-Data users.
 */
export function AnimatedBrandHero({
  className,
  mp4Src,
  posterSrc,
  webmSrc,
}: AnimatedBrandHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [canPlayMotion, setCanPlayMotion] = useState(false);

  useEffect(() => {
    if ((!mp4Src && !webmSrc) || !rootRef.current) return undefined;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    if (connection?.saveData || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setCanPlayMotion(true);
        observer.disconnect();
      },
      { rootMargin: '160px' },
    );
    observer.observe(rootRef.current);
    return () => {
      observer.disconnect();
    };
  }, [mp4Src, webmSrc]);

  const classes = ['bidly-animated-brand-hero', className].filter(Boolean).join(' ');
  const motionAvailable = canPlayMotion && (mp4Src !== undefined || webmSrc !== undefined);

  return (
    <div
      aria-hidden="true"
      className={classes}
      data-motion={motionAvailable ? 'playing' : 'static'}
      ref={rootRef}
    >
      <BrandMark className="bidly-animated-brand-hero__mark" />
      {motionAvailable ? (
        <video
          autoPlay
          className="bidly-animated-brand-hero__video"
          loop
          muted
          playsInline
          poster={posterSrc}
          preload="none"
        >
          {webmSrc ? <source src={webmSrc} type="video/webm" /> : null}
          {mp4Src ? <source src={mp4Src} type="video/mp4" /> : null}
        </video>
      ) : null}
    </div>
  );
}
