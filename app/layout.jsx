import { Archivo_Black, IBM_Plex_Mono, Libre_Baskerville } from 'next/font/google';
import './globals.css';

const archivo = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-archivo',
});

const plex = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex',
});

const baskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: '700',
  variable: '--font-baskerville',
});

export const metadata = {
  title: 'Vidyut Chakrabarti - Certificate Archive',
  description: 'Certificate archive with field, provider, workload, and timeline views.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} ${plex.variable} ${baskerville.variable}`}>
        {children}
      </body>
    </html>
  );
}
