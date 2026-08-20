import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bidly — обратный спрос',
    short_name: 'Bidly',
    description:
      'Платформа, где покупатели объединяют спрос, а компании конкурируют полными условиями.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f8ff',
    theme_color: '#3d36df',
    icons: [
      {
        src: '/brand-mark.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
