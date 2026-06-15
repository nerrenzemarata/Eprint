import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'EPrint Admin',
};

const navLinks = [
  { href: '/',              label: 'Dashboard',     icon: '▦' },
  { href: '/transactions',  label: 'Transactions',  icon: '⇄' },
  { href: '/pricing',       label: 'Pricing',       icon: '₱' },
  { href: '/subscriptions', label: 'Subscriptions', icon: '★' },
  { href: '/vouchers',      label: 'Vouchers',      icon: '◈' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex" style={{ backgroundColor: '#e8eaf0', color: '#1a2a6c' }}>

        {/* Sidebar */}
        <aside
          className="w-56 shrink-0 flex flex-col py-8 px-4 gap-1"
          style={{ backgroundColor: '#1a2a6c' }}
        >
          {/* Logo */}
          <div className="px-3 mb-8">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xl font-black tracking-tight"
                style={{ color: '#f0b429' }}
              >
                E
              </span>
              <span className="text-xl font-black text-white tracking-tight">Print</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Admin Panel
            </p>
          </div>

          {/* Nav Links */}
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ color: 'rgba(255,255,255,0.75)' }}
            >
              <span style={{ color: '#f0b429', fontSize: 13 }}>{l.icon}</span>
              {l.label}
            </Link>
          ))}

          {/* Logout */}
          <div className="mt-auto">
            <form action="/api/logout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                <span style={{ fontSize: 13 }}>⎋</span>
                Logout
              </button>
            </form>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>

      </body>
    </html>
  );
}
