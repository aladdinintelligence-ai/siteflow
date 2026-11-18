import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { TopNav } from '@/components/shared/TopNav';
import { GuidedDemoBar } from '@/components/shared/GuidedDemoBar';
import { ToastNotice } from '@/components/shared/ToastNotice';
import Link from 'next/link';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DJ Civil SiteFlow | Construction Operations & Gate Logistics',
  description:
    'Clickable sales prototype connecting DJ Civil orders, suppliers, hauliers, automated gate entry, and delivery verification.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full w-full max-w-full overflow-x-hidden flex flex-col bg-[#F7F7F5] text-[#14171A] font-sans">
        <TopNav />
        <GuidedDemoBar />
        <main className="flex-1 w-full max-w-full flex flex-col overflow-x-hidden">{children}</main>
        <footer className="w-full bg-[#FFFFFF] border-t border-[#E7E5E0] py-4 px-3 sm:px-6 text-xs text-[#6B7280] select-none">
          <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
              <span className="font-semibold text-[#14171A]">DJ Civil SiteFlow</span>
              <span>·</span>
              <span className="text-[#6B7280]">Prototype Demonstration</span>
              <span className="hidden xs:inline">·</span>
              <span className="hidden xs:inline">Sales Walkthrough</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Link href="/discovery" className="hover:text-[#14171A] transition-colors">
                Kickoff questions
              </Link>
              <span>·</span>
              <span>Mock data sandbox</span>
            </div>
          </div>
        </footer>
        <ToastNotice />
      </body>
    </html>
  );
}
