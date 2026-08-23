import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bidly — обратный спрос',
    short_name: 'Bidly',
    description:
      'Платформа, где покупатели объединяют спрос, а компании конкурируют полными условиями.',
    start_url: '/',
    display: 'standalone',
    background_color: '#070812',
    theme_color: '#070812',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        purpose: 'maskable',
        type: 'image/png',
      },
      {
        src: '/pwa-maskable-192x192.png',
        sizes: '192x192',
        purpose: 'maskable',
        type: 'image/png',
      },
    ],
  };
}
