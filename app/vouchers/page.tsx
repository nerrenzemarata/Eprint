import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function VouchersPage() {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('vouchers')
    .select('*')
    .order('createdAt', { ascending: false });

  const rows = data ?? [];
  const active = rows.filter((v) => v.status === 'active').length;
  const used = rows.filter((v) => v.status === 'used').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black" style={{ color: '#1a2a6c' }}>Vouchers</h1>
        <div className="flex gap-4 mt-2 text-sm font-semibold">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e' }}
          >
            {active} active
          </span>
          <span
            className="px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: 'rgba(107,122,153,0.12)', color: '#6b7a99' }}
          >
            {used} used
          </span>
          <span
            className="px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: 'rgba(26,42,108,0.08)', color: '#1a2a6c' }}
          >
            {rows.length} total
          </span>
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 16px rgba(26,42,108,0.10)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#1a2a6c' }}>
              {['Code', 'Amount', 'Status', 'Created', 'Tablet'].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-bold uppercase tracking-widest ${h === 'Amount' ? 'text-right' : 'text-left'}`}
                  style={{ color: i === 0 ? '#f0b429' : 'rgba(255,255,255,0.6)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((v, i) => (
              <tr
                key={v.code}
                style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(26,42,108,0.08)' : 'none' }}
              >
                <td className="px-4 py-3 font-mono font-bold" style={{ color: '#1a2a6c' }}>{v.code}</td>
                <td className="px-4 py-3 text-right font-black" style={{ color: '#1a2a6c' }}>
                  ₱{Number(v.amount).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: v.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(107,122,153,0.12)',
                      color: v.status === 'active' ? '#22c55e' : '#6b7a99',
                    }}
                  >
                    {v.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: '#6b7a99' }}>
                  {new Date(v.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {v.tablet_id ? (
                    <Link
                      href={`/devices/${v.tablet_id}`}
                      className="inline-block font-mono text-xs px-2 py-1 rounded-lg hover:opacity-80 transition-opacity max-w-[120px] truncate"
                      style={{ backgroundColor: 'rgba(26,42,108,0.08)', color: '#1a2a6c' }}
                      title={v.tablet_id}
                    >
                      {v.tablet_id.slice(0, 8)}…
                    </Link>
                  ) : <span style={{ color: '#6b7a99' }}>—</span>}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm" style={{ color: '#6b7a99' }}>
                  No vouchers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
