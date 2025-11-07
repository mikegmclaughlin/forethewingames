
import './globals.css';
import React from 'react';

const BRAND = process.env.BRAND_NAME || 'Fore the Win Games';

export const metadata = {
  title: BRAND,
  description: 'Live Trivia Night',
  icons: { icon: '/icon.svg' }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <img src="/icon.svg" alt="" width="28" height="28"/>
          <div className="brand">{BRAND}</div>
        </header>
        <main style={{maxWidth:900, margin:'0 auto', padding:'16px'}}>
          {children}
        </main>
      </body>
    </html>
  );
}
