import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function getStats() {
  const supabase = getSupabase();
  const today = new Date().toISOString().split('T')[0];

  const [totalRes, todayRes, txCountRes, subRes, deviceRes] = await Promise.all([
    supabase.from('transactions').select('totalAmount').eq('paymentStatus', 'completed'),
    supabase.from('transactions').select('totalAmount').eq('paymentStatus', 'completed').gte('timestamp', today),
    supabase.from('transactions').select('id', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('devices').select('id,lastSeen').order('lastSeen', { ascending: false }).limit(5),
  ]);

  const totalRevenue = (totalRes.data ?? []).reduce((s, r) => s + Number(r.totalAmount), 0);
  const todayRevenue = (todayRes.data ?? []).reduce((s, r) => s + Number(r.totalAmount), 0);

  return {
    totalRevenue,
    todayRevenue,
    txCount: txCountRes.count ?? 0,
    activeSubscriptions: subRes.count ?? 0,
    devices: deviceRes.data ?? [],
  };
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Today Revenue" value={`₱${stats.todayRevenue.toFixed(2)}`} />
        <StatCard label="Total Revenue" value={`₱${stats.totalRevenue.toFixed(2)}`} />
        <StatCard label="Total Transactions" value={String(stats.txCount)} />
        <StatCard label="Active Subscribers" value={String(stats.activeSubscriptions)} />
      </div>

      <h2 className="text-lg font-semibold mb-3">Devices</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-widest">
              <th className="px-6 py-3 text-left">Tablet ID</th>
              <th className="px-6 py-3 text-left">Last Seen</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.devices.map((d) => {
              const lastSeen = new Date(d.lastSeen);
              const minutesAgo = Math.floor((Date.now() - lastSeen.getTime()) / 60000);
              const online = minutesAgo < 10;
              return (
                <tr key={d.id} className="border-b border-gray-800 last:border-0">
                  <td className="px-6 py-3 font-mono">{d.id}</td>
                  <td className="px-6 py-3 text-gray-400">{lastSeen.toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${online ? 'text-green-400' : 'text-gray-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-400' : 'bg-gray-600'}`} />
                      {online ? 'Online' : `${minutesAgo}m ago`}
                    </span>
                  </td>
                </tr>
              );
            })}
            {stats.devices.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-600">
                  No devices have synced yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
