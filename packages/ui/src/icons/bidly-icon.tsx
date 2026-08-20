import type { SVGProps } from 'react';

export type BidlyIconName =
  | 'arrow-right'
  | 'building'
  | 'calendar'
  | 'check-circle'
  | 'chevron-right'
  | 'location'
  | 'shield'
  | 'users';

export type BidlyIconProps = SVGProps<SVGSVGElement> & {
  readonly name: BidlyIconName;
};

const paths: Readonly<Record<BidlyIconName, readonly string[]>> = {
  'arrow-right': ['M5 12h14', 'm13 6 6 6-6 6'],
  building: [
    'M4 21h16',
    'M6 21V5.5A1.5 1.5 0 0 1 7.5 4h9A1.5 1.5 0 0 1 18 5.5V21',
    'M9 8h1',
    'M14 8h1',
    'M9 12h1',
    'M14 12h1',
    'M11 21v-4h2v4',
  ],
  calendar: [
    'M7 3v3',
    'M17 3v3',
    'M4.5 9h15',
    'M5.5 5h13A1.5 1.5 0 0 1 20 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-12A1.5 1.5 0 0 1 5.5 5Z',
    'M8 13h3',
    'M8 16h5',
  ],
  'check-circle': ['M20 11.1V12A8 8 0 1 1 15.3 4.7', 'm20 5-8.2 8.2L9.5 11'],
  'chevron-right': ['m9 18 6-6-6-6'],
  location: [
    'M20 10.2c0 5.6-8 10.3-8 10.3s-8-4.7-8-10.3a8 8 0 1 1 16 0Z',
    'M12 13a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z',
  ],
  shield: ['M12 21s7-3.5 7-9V5l-7-2-7 2v7c0 5.5 7 9 7 9Z', 'm9 12 2 2 4-4'],
  users: [
    'M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20',
    'M10 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
    'M17 10a3 3 0 0 0 0-6',
    'M20 20v-1.2a4.2 4.2 0 0 0-2.8-4',
  ],
};

export function BidlyIcon({ name, ...props }: BidlyIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {paths[name].map((d) => (
        <path d={d} key={d} />
      ))}
    </svg>
  );
}
