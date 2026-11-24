import type { Metadata } from 'next';
import './globals.css';
import { TopNav } from '@/components/shared/TopNav';
import { ToastNotice } from '@/components/shared/ToastNotice';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'DJ Civil SiteFlow | Construction Operations & Gate Logistics',
  description:
    'Enterprise operations platform connecting DJ Civil purchase orders, suppliers, hauliers, automated gate entry, and delivery verification.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased font-sans" style={{ colorScheme: 'light' }}>
      <body
        className="civil-blueprint-bg min-h-full w-full max-w-full overflow-x-hidden flex flex-col bg-[#F8F8F6] text-[#14171A] font-sans"
        style={{ colorScheme: 'light' }}
      >
        <AuthProvider>
          <TopNav />
          <main className="flex-1 w-full max-w-full flex flex-col overflow-x-hidden">{children}</main>
          <ToastNotice />
        </AuthProvider>
        <footer className="w-full bg-[#FFFFFF] border-t border-[#E7E5E0] py-4 px-3 sm:px-6 text-xs text-[#6B7280] select-none">
          <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
              <span className="font-semibold text-[#14171A]">DJ Civil SiteFlow</span>
              <span>·</span>
              <span className="text-[#6B7280]">Construction Operations Management</span>
              <span className="hidden xs:inline">·</span>
              <span className="hidden xs:inline">Version 1.0 MVP</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span>DJ Civil Engineering Ltd</span>
              <span>·</span>
              <span>Authorized Personnel Only</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
