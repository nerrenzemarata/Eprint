import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function SubscriptionsPage() {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .order('createdAt', { ascending: false });

  const rows = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Subscriptions</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-widest">
              <th className="px-4 py-3 text-left">Account ID</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">B&W left</th>
              <th className="px-4 py-3 text-right">Color left</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Tablet</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.accountId} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                <td className="px-4 py-3 font-mono text-xs">{s.accountId}</td>
                <td className="px-4 py-3 capitalize">{s.plan}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${s.status === 'active' ? 'text-green-400' : 'text-gray-500'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{s.remainingBw}</td>
                <td className="px-4 py-3 text-right">{s.remainingColor}</td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.tablet_id}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-600">
                  No subscriptions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
