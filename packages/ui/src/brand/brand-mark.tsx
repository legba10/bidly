import { useId } from 'react';

import type { ComponentPropsWithoutRef } from 'react';

export type BrandMarkProps = ComponentPropsWithoutRef<'svg'>;

/**
 * Bidly's vector-first ribbon mark. It is decorative by default; consumers
 * that render the mark without `BrandLogo` can provide an accessible name.
 */
export function BrandMark({ className, ...svgProps }: BrandMarkProps) {
  const instanceId = useId().replaceAll(':', '');
  const hasAccessibleName =
    svgProps['aria-label'] !== undefined || svgProps['aria-labelledby'] !== undefined;

  return (
    <svg
      {...svgProps}
      aria-hidden={hasAccessibleName ? undefined : true}
      className={['bidly-brand-mark', className].filter(Boolean).join(' ')}
      fill="none"
      focusable="false"
      role={hasAccessibleName ? 'img' : undefined}
      viewBox="0 0 120 140"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${instanceId}-top`} x1="20" x2="105" y1="14" y2="69">
          <stop stopColor="#0A1BFF" />
          <stop offset="0.46" stopColor="#206BFF" />
          <stop offset="1" stopColor="#00D4FF" />
        </linearGradient>
        <linearGradient id={`${instanceId}-front`} x1="20" x2="101" y1="59" y2="101">
          <stop stopColor="#0012A5" />
          <stop offset="0.48" stopColor="#0A44FF" />
          <stop offset="1" stopColor="#00CBEA" />
        </linearGradient>
        <linearGradient id={`${instanceId}-lower`} x1="24" x2="101" y1="98" y2="130">
          <stop stopColor="#0010AA" />
          <stop offset="0.5" stopColor="#1964FF" />
          <stop offset="1" stopColor="#0063E8" />
        </linearGradient>
        <linearGradient id={`${instanceId}-shadow`} x1="27" x2="85" y1="24" y2="105">
          <stop stopColor="#010B5B" stopOpacity="0.9" />
          <stop offset="1" stopColor="#0A1BFF" stopOpacity="0" />
        </linearGradient>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="168"
          id={`${instanceId}-depth`}
          width="148"
          x="-14"
          y="-14"
        >
          <feDropShadow dx="0" dy="7" floodColor="#00115F" floodOpacity="0.28" stdDeviation="5" />
        </filter>
      </defs>
      <g filter={`url(#${instanceId}-depth)`}>
        <path
          d="M24 7c18 13 42 11 60 19 17 8 27 21 22 35-5 13-22 20-40 20-16 0-30-3-42-10V7Z"
          fill={`url(#${instanceId}-top)`}
        />
        <path
          d="M24 7v52c12-20 28-29 47-27 14 1 25 7 31 16-4-12-14-19-29-24C54 17 39 18 24 7Z"
          fill={`url(#${instanceId}-shadow)`}
        />
        <path
          d="M24 59c18 12 37 16 55 11 16-4 24-12 24-22 8 13 2 29-14 38-18 10-42 10-65-2V59Z"
          fill={`url(#${instanceId}-front)`}
        />
        <path
          d="M24 84c21 11 44 12 62 4 16-7 22-18 17-31 14 17 10 39-10 51-19 12-45 11-69-1V84Z"
          fill={`url(#${instanceId}-lower)`}
        />
        <path
          d="M24 107c17 8 39 9 55 2 11-5 19-12 24-21-2 19-15 35-34 42-16 6-31 4-45-4v-19Z"
          fill="#061CD5"
        />
        <path d="M24 59c13 9 27 13 42 12-16 1-30-2-42-10v-2Z" fill="#8DDFFF" fillOpacity="0.42" />
      </g>
    </svg>
  );
}
