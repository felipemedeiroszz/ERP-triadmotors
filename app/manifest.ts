import type { MetadataRoute } from 'next'

const sizes = [48, 72, 96, 128, 144, 152, 167, 180, 192, 384, 512]

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TRIAD MOTO PARTS — ERP & PDV',
    short_name: 'TRIAD ERP',
    description: 'Mais controle para o seu negócio.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#0b0b0d',
    theme_color: '#0b0b0d',
    lang: 'pt-BR',
    icons: [
      ...sizes.map((s) => ({ src: `/icons/icon-${s}.png`, sizes: `${s}x${s}`, type: 'image/png' })),
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
