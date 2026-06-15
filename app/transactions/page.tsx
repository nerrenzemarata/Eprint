import { getSupabase } from '@/lib/supabase';

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
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-widest">
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Tablet</th>
              <th className="px-4 py-3 text-right">Pages</th>
              <th className="px-4 py-3 text-right">Copies</th>
              <th className="px-4 py-3 text-left">Payment</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                  {new Date(tx.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{tx.tablet_id}</td>
                <td className="px-4 py-3 text-right">{tx.totalPages}</td>
                <td className="px-4 py-3 text-right">{tx.copies}</td>
                <td className="px-4 py-3 capitalize">{tx.paymentMethod}</td>
                <td className="px-4 py-3 text-right font-medium">₱{Number(tx.totalAmount).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${
                    tx.paymentStatus === 'completed' ? 'text-green-400' :
                    tx.paymentStatus === 'failed' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {tx.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-600">
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
            <a href={`?page=${page - 1}`} className="px-3 py-1 bg-gray-800 rounded-lg hover:bg-gray-700">
              ← Prev
            </a>
          )}
          <span className="px-3 py-1 text-gray-500">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <a href={`?page=${page + 1}`} className="px-3 py-1 bg-gray-800 rounded-lg hover:bg-gray-700">
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
