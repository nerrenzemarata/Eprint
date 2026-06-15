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
    supabase.from('devices').select('id,lastSeen,local_ip,tunnel_url').order('lastSeen', { ascending: false }).limit(5),
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

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        backgroundColor: accent ? '#1a2a6c' : '#ffffff',
        boxShadow: '0 4px 16px rgba(26,42,108,0.10)',
      }}
    >
      <p
        className="text-xs font-bold uppercase tracking-widest mb-2"
        style={{ color: accent ? 'rgba(255,255,255,0.55)' : '#6b7a99' }}
      >
        {label}
      </p>
      <p
        className="text-3xl font-black"
        style={{ color: accent ? '#f0b429' : '#1a2a6c' }}
      >
        {value}
      </p>
    </div>
  );
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black" style={{ color: '#1a2a6c' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: '#6b7a99' }}>Welcome back — here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Today's Revenue" value={`₱${stats.todayRevenue.toFixed(2)}`} accent />
        <StatCard label="Total Revenue" value={`₱${stats.totalRevenue.toFixed(2)}`} />
        <StatCard label="Total Transactions" value={String(stats.txCount)} />
        <StatCard label="Active Subscribers" value={String(stats.activeSubscriptions)} />
      </div>

      {/* Devices */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: '#1a2a6c' }}>Devices</h2>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 16px rgba(26,42,108,0.10)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#1a2a6c' }}>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest" style={{ color: '#f0b429' }}>Tablet ID</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>Last Seen</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>Remote Access</th>
            </tr>
          </thead>
          <tbody>
            {stats.devices.map((d, i) => {
              const lastSeen = new Date(d.lastSeen);
              const minutesAgo = Math.floor((Date.now() - lastSeen.getTime()) / 60000);
              const online = minutesAgo < 10;
              const tunnelUrl = (d as any).tunnel_url;
              return (
                <tr
                  key={d.id}
                  style={{
                    borderBottom: i < stats.devices.length - 1 ? '1px solid rgba(26,42,108,0.08)' : 'none',
                  }}
                >
                  <td className="px-6 py-4 font-mono font-bold text-xs" style={{ color: '#1a2a6c' }}>{d.id}</td>
                  <td className="px-6 py-4 text-xs" style={{ color: '#6b7a99' }}>{lastSeen.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: online ? 'rgba(34,197,94,0.12)' : 'rgba(107,122,153,0.12)',
                        color: online ? '#22c55e' : '#6b7a99',
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: online ? '#22c55e' : '#6b7a99' }}
                      />
                      {online ? 'Online' : `${minutesAgo}m ago`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {tunnelUrl ? (
                      <a
                        href={tunnelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                        style={{ backgroundColor: '#f0b429', color: '#1a2a6c' }}
                      >
                        Open Tunnel ↗
                      </a>
                    ) : d.local_ip && d.local_ip !== '0.0.0.0' ? (
                      <a
                        href={`http://${d.local_ip}:8082`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono"
                        style={{ color: '#1a2a6c' }}
                      >
                        {d.local_ip}:8082
                      </a>
                    ) : (
                      <span className="text-xs" style={{ color: '#6b7a99' }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {stats.devices.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm" style={{ color: '#6b7a99' }}>
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
