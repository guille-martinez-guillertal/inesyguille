import type { Metadata } from 'next';
import { Bodoni_Moda, Inter } from 'next/font/google';
import './globals.css';

const display = Bodoni_Moda({ variable: '--font-display', subsets: ['latin'] });
const sans = Inter({ variable: '--font-sans', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://inesyguille.guillertal.workers.dev',
  ),
  title: 'Inés & Guille · 26.09.2026',
  description:
    'Toda la información para acompañarnos en nuestra boda en Finca El Venero, Navaluenga.',
  referrer: 'no-referrer',
  icons: { icon: '/favicon.png' },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    alternateLocale: ['en_GB'],
    title: 'Inés & Guille · 26.09.2026',
    description: 'Un fin de semana para celebrar juntos en Finca El Venero, Navaluenga.',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Inés y Guille · 26 de septiembre de 2026 · Navaluenga' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inés & Guille · 26.09.2026',
    description: 'Un fin de semana para celebrar juntos en Finca El Venero, Navaluenga.',
    images: ['/og.jpg'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${sans.variable}`}>{children}</body>
    </html>
  );
}
