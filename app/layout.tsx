import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AFK RPG Game',
  description: 'Un juego RPG automático increíble',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
