import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Chakra_Petch } from 'next/font/google'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PwaRegister } from '@/components/pwa-register'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const chakra = Chakra_Petch({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-chakra',
})

export const metadata: Metadata = {
  title: { default: 'TRIAD MOTO PARTS', template: '%s | TRIAD MOTO PARTS' },
  description: 'ERP e PDV da TRIAD MOTO PARTS — Mais controle para o seu negócio.',
  applicationName: 'TRIAD ERP',
  appleWebApp: { capable: true, title: 'TRIAD ERP', statusBarStyle: 'black-translucent' },
  icons: {
    icon: [
      { url: '/icons/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-180.png', sizes: '180x180' }],
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0b0b0d',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} ${chakra.variable} bg-background`}>
      <body className="antialiased">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster theme="dark" position="top-right" richColors closeButton />
        <PwaRegister />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
