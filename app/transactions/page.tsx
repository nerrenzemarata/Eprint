import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1'));
  const pageSize = 50;
  const from = (page - 1) * pageSize;

  const supabase = getSupabase();
  const { data, count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .order('timestamp', { ascending: false })
    .range(from, from + pageSize - 1);

  const rows = data ?? [];
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black" style={{ color: '#1a2a6c' }}>Transactions</h1>
        <p className="text-sm mt-1" style={{ color: '#6b7a99' }}>{count ?? 0} total records</p>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 16px rgba(26,42,108,0.10)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#1a2a6c' }}>
              {['Date', 'Tablet', 'Pages', 'Copies', 'Payment', 'Amount', 'Status'].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-bold uppercase tracking-widest ${i >= 2 && i <= 3 ? 'text-right' : 'text-left'}`}
                  style={{ color: i === 0 ? '#f0b429' : 'rgba(255,255,255,0.6)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((tx, i) => (
              <tr
                key={tx.id}
                style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(26,42,108,0.08)' : 'none' }}
              >
                <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: '#6b7a99' }}>
                  {new Date(tx.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: '#6b7a99' }}>{tx.tablet_id}</td>
                <td className="px-4 py-3 text-right font-semibold" style={{ color: '#1a2a6c' }}>{tx.totalPages}</td>
                <td className="px-4 py-3 text-right font-semibold" style={{ color: '#1a2a6c' }}>{tx.copies}</td>
                <td className="px-4 py-3 capitalize font-medium" style={{ color: '#1a2a6c' }}>{tx.paymentMethod}</td>
                <td className="px-4 py-3 text-right font-black" style={{ color: '#1a2a6c' }}>
                  ₱{Number(tx.totalAmount).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor:
                        tx.paymentStatus === 'completed' ? 'rgba(34,197,94,0.12)' :
                        tx.paymentStatus === 'failed' ? 'rgba(239,68,68,0.12)' :
                        'rgba(240,180,41,0.15)',
                      color:
                        tx.paymentStatus === 'completed' ? '#22c55e' :
                        tx.paymentStatus === 'failed' ? '#ef4444' :
                        '#d97706',
                    }}
                  >
                    {tx.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: '#6b7a99' }}>
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 mt-4 justify-end text-sm">
          {page > 1 && (
            <a
              href={`?page=${page - 1}`}
              className="px-4 py-2 rounded-xl font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#1a2a6c', color: '#ffffff' }}
            >
              ← Prev
            </a>
          )}
          <span
            className="px-4 py-2 rounded-xl font-semibold"
            style={{ backgroundColor: '#ffffff', color: '#6b7a99', boxShadow: '0 2px 8px rgba(26,42,108,0.08)' }}
          >
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`?page=${page + 1}`}
              className="px-4 py-2 rounded-xl font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#1a2a6c', color: '#ffffff' }}
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
