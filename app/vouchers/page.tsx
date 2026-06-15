import { supabase } from '@/lib/supabase';

export default async function VouchersPage() {
  const { data } = await supabase
    .from('vouchers')
    .select('*')
    .order('createdAt', { ascending: false });

  const rows = data ?? [];
  const active = rows.filter((v) => v.status === 'active').length;
  const used = rows.filter((v) => v.status === 'used').length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Vouchers</h1>
      <div className="flex gap-4 mb-6 text-sm text-gray-400">
        <span className="text-green-400 font-medium">{active} active</span>
        <span>·</span>
        <span>{used} used</span>
        <span>·</span>
        <span>{rows.length} total</span>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-widest">
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Tablet</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.code} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                <td className="px-4 py-3 font-mono">{v.code}</td>
                <td className="px-4 py-3 text-right">₱{Number(v.amount).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${v.status === 'active' ? 'text-green-400' : 'text-gray-500'}`}>
                    {v.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {new Date(v.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{v.tablet_id}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-600">
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
