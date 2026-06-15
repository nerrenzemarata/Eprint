import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'EPrint Admin',
};

const navLinks = [
  { href: '/',               label: 'Dashboard' },
  { href: '/transactions',   label: 'Transactions' },
  { href: '/pricing',        label: 'Pricing' },
  { href: '/subscriptions',  label: 'Subscriptions' },
  { href: '/vouchers',       label: 'Vouchers' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100 flex">
        <aside className="w-52 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col py-8 px-4 gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 px-2">
            EPrint Admin
          </p>
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-auto">
            <form action="/api/logout" method="POST">
              <button
                type="submit"
                className="w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-gray-800 text-left transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </aside>
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
