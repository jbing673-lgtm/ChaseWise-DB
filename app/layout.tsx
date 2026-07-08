import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChaseWise — AI-Powered Debt Collection for Small Businesses',
  description:
    'Turn unpaid invoices into paid ones. ChaseWise helps small businesses send professional, multi-round collection emails powered by AI.',
  keywords: [
    'debt collection',
    'invoice follow-up',
    'small business',
    'AI email',
    'overdue payments',
    'collection assistant',
  ],
  openGraph: {
    title: 'ChaseWise — AI-Powered Debt Collection',
    description:
      'Professional collection emails for small businesses. Start free.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}