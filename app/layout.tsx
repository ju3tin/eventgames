import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
// import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import '@solana/wallet-adapter-react-ui/styles.css';

const geist = Geist({ subsets: ['latin'] });
const geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Motion Play - Achievements',
  description: 'Track your achievements and unlock rewards across all Motion Play games',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
