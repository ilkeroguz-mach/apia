import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Visual API Tester & Flow Runner',
  description: 'Interaktif diagram ve HTTP akış çalıştırıcı'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
