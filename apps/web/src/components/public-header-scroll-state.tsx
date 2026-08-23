'use client';

import { useEffect } from 'react';

export function PublicHeaderScrollState({ headerId }: { readonly headerId: string }) {
  useEffect(() => {
    const header = document.getElementById(headerId);
    if (!header) return undefined;
    let animationFrame: number | undefined;

    const update = () => {
      animationFrame = undefined;
      header.dataset['scrolled'] = String(window.scrollY > 18);
    };
    const schedule = () => {
      animationFrame ??= window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    return () => {
      window.removeEventListener('scroll', schedule);
      if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame);
    };
  }, [headerId]);

  return null;
}
