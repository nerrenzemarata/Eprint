import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import PricingForm from '@/app/pricing/PricingForm';
import { updatePrice } from '@/app/pricing/actions';
import RemotePrintClient from '@/app/remote-print/RemotePrintClient';

export const dynamic = 'force-dynamic';

type Tab = 'overview' | 'transactions' | 'pricing' | 'remote-print';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview',     label: 'Overview',      icon: '▦' },
  { id: 'transactions', label: 'Transactions',   icon: '⇄' },
  { id: 'pricing',      label: 'Pricing',        icon: '₱' },
  { id: 'remote-print', label: 'Remote Print',   icon: '⎙' },
];

export default async function DevicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const { id } = await params;
  const { tab: tabParam, page: pageParam } = await searchParams;
  const tab: Tab = (TABS.find(t => t.id === tabParam)?.id) ?? 'overview';

  const supabase = getSupabase();

  // Fetch device
  const { data: device } = await supabase
    .from('devices')
    .select('id,lastSeen,local_ip,tunnel_url')
    .eq('id', id)
    .single();

  if (!device) notFound();

  const lastSeen = new Date(device.lastSeen);
  const minutesAgo = Math.floor((Date.now() - lastSeen.getTime()) / 60000);
  const online = minutesAgo < 10;
  const tunnelUrl = (device as any).tunnel_url ?? null;

  // Short display ID
  const shortId = id.length > 16 ? `${id.slice(0, 8)}…${id.slice(-6)}` : id;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link href="/" className="text-sm font-semibold hover:opacity-70" style={{ color: '#6b7a99' }}>
            Dashboard
          </Link>
          <span style={{ color: '#6b7a99' }}>›</span>
          <span className="text-sm font-semibold" style={{ color: '#1a2a6c' }}>Device</span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-black font-mono" style={{ color: '#1a2a6c' }}>{shortId}</h1>
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: online ? 'rgba(34,197,94,0.12)' : 'rgba(107,122,153,0.12)',
              color: online ? '#22c55e' : '#6b7a99',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: online ? '#22c55e' : '#6b7a99' }} />
            {online ? 'Online' : `${minutesAgo}m ago`}
          </span>
        </div>
        <p className="text-xs mt-1 font-mono" style={{ color: '#6b7a99' }}>{id}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-2xl w-fit" style={{ backgroundColor: 'rgba(26,42,108,0.08)' }}>
        {TABS.map(t => {
          const active = t.id === tab;
          return (
            <Link
              key={t.id}
              href={`/devices/${id}?tab=${t.id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                backgroundColor: active ? '#1a2a6c' : 'transparent',
                color: active ? '#f0b429' : '#6b7a99',
              }}
            >
              <span style={{ fontSize: 12 }}>{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && <OverviewTab device={device} online={online} minutesAgo={minutesAgo} tunnelUrl={tunnelUrl} deviceId={id} />}
      {tab === 'transactions' && <TransactionsTab deviceId={id} pageParam={pageParam} />}
      {tab === 'pricing' && <PricingTab />}
      {tab === 'remote-print' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-black" style={{ color: '#1a2a6c' }}>Remote Print</h2>
            <p className="text-sm mt-1" style={{ color: '#6b7a99' }}>Send files directly to this kiosk.</p>
          </div>
          <RemotePrintClient tunnelUrl={tunnelUrl} />
        </div>
      )}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

async function OverviewTab({
  device,
  online,
  minutesAgo,
  tunnelUrl,
  deviceId,
}: {
  device: any;
  online: boolean;
  minutesAgo: number;
  tunnelUrl: string | null;
  deviceId: string;
}) {
  const supabase = getSupabase();

  const [txRes, revenueRes] = await Promise.all([
    supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('tablet_id', deviceId),
    supabase.from('transactions').select('totalAmount').eq('tablet_id', deviceId).eq('paymentStatus', 'completed'),
  ]);

  const txCount = txRes.count ?? 0;
  const revenue = (revenueRes.data ?? []).reduce((s, r) => s + Number(r.totalAmount), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#1a2a6c', boxShadow: '0 4px 16px rgba(26,42,108,0.10)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>Total Revenue</p>
          <p className="text-3xl font-black" style={{ color: '#f0b429' }}>₱{revenue.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 16px rgba(26,42,108,0.10)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#6b7a99' }}>Transactions</p>
          <p className="text-3xl font-black" style={{ color: '#1a2a6c' }}>{txCount}</p>
        </div>
      </div>

      {/* Device Info */}
      <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 16px rgba(26,42,108,0.10)' }}>
        <p className="font-black text-sm" style={{ color: '#1a2a6c' }}>Device Info</p>

        <Row label="Tablet ID" value={<span className="font-mono text-xs break-all">{deviceId}</span>} />
        <Row label="Last Seen" value={device.lastSeen ? new Date(device.lastSeen).toLocaleString() : '—'} />
        <Row label="Status" value={
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: online ? 'rgba(34,197,94,0.12)' : 'rgba(107,122,153,0.12)',
              color: online ? '#22c55e' : '#6b7a99',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: online ? '#22c55e' : '#6b7a99' }} />
            {online ? 'Online' : `Offline (${minutesAgo}m ago)`}
          </span>
        } />
        <Row label="Local IP" value={
          device.local_ip && device.local_ip !== '0.0.0.0' ? (
            <a href={`http://${device.local_ip}:8082`} target="_blank" rel="noopener noreferrer"
              className="font-mono text-xs hover:opacity-70" style={{ color: '#1a2a6c' }}>
              {device.local_ip}:8082 ↗
            </a>
          ) : <span style={{ color: '#6b7a99' }}>—</span>
        } />
        <Row label="Tunnel URL" value={
          tunnelUrl ? (
            <a href={tunnelUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs font-mono hover:opacity-70 break-all" style={{ color: '#1a2a6c' }}>
              {tunnelUrl} ↗
            </a>
          ) : <span style={{ color: '#6b7a99' }}>Not connected</span>
        } />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs font-bold uppercase tracking-widest shrink-0" style={{ color: '#6b7a99' }}>{label}</span>
      <span className="text-sm font-semibold text-right" style={{ color: '#1a2a6c' }}>{value}</span>
    </div>
  );
}

// ─── Transactions Tab ──────────────────────────────────────────────────────────

async function TransactionsTab({ deviceId, pageParam }: { deviceId: string; pageParam?: string }) {
  const supabase = getSupabase();
  const page = Math.max(1, parseInt(pageParam ?? '1'));
  const pageSize = 50;
  const from = (page - 1) * pageSize;

  const { data, count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('tablet_id', deviceId)
    .order('timestamp', { ascending: false })
    .range(from, from + pageSize - 1);

  const rows = data ?? [];
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black" style={{ color: '#1a2a6c' }}>Transactions</h2>
        <p className="text-sm mt-1" style={{ color: '#6b7a99' }}>{count ?? 0} records for this device</p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 16px rgba(26,42,108,0.10)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#1a2a6c' }}>
              {['Date', 'Pages', 'Copies', 'Payment', 'Amount', 'Status'].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-bold uppercase tracking-widest ${['Pages', 'Copies'].includes(h) ? 'text-right' : 'text-left'}`}
                  style={{ color: i === 0 ? '#f0b429' : 'rgba(255,255,255,0.6)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((tx, i) => (
              <tr key={tx.id} style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(26,42,108,0.08)' : 'none' }}>
                <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: '#6b7a99' }}>
                  {new Date(tx.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-semibold" style={{ color: '#1a2a6c' }}>{tx.totalPages}</td>
                <td className="px-4 py-3 text-right font-semibold" style={{ color: '#1a2a6c' }}>{tx.copies}</td>
                <td className="px-4 py-3 capitalize font-medium" style={{ color: '#1a2a6c' }}>{tx.paymentMethod}</td>
                <td className="px-4 py-3 font-black" style={{ color: '#1a2a6c' }}>₱{Number(tx.totalAmount).toFixed(2)}</td>
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
                <td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: '#6b7a99' }}>
                  No transactions for this device yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 mt-4 justify-end text-sm">
          {page > 1 && (
            <a href={`?tab=transactions&page=${page - 1}`}
              className="px-4 py-2 rounded-xl font-semibold hover:opacity-80"
              style={{ backgroundColor: '#1a2a6c', color: '#ffffff' }}>
              ← Prev
            </a>
          )}
          <span className="px-4 py-2 rounded-xl font-semibold"
            style={{ backgroundColor: '#ffffff', color: '#6b7a99', boxShadow: '0 2px 8px rgba(26,42,108,0.08)' }}>
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <a href={`?tab=transactions&page=${page + 1}`}
              className="px-4 py-2 rounded-xl font-semibold hover:opacity-80"
              style={{ backgroundColor: '#1a2a6c', color: '#ffffff' }}>
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Pricing Tab ───────────────────────────────────────────────────────────────

async function PricingTab() {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('pricing')
    .select('paperSize,colorMode,pricePerPage,updatedAt')
    .order('colorMode');
  const pricing = data ?? [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black" style={{ color: '#1a2a6c' }}>Pricing</h2>
        <p className="text-sm mt-1" style={{ color: '#6b7a99' }}>
          Pricing is shared across all devices. Changes take effect within 5 minutes.
        </p>
      </div>
      <PricingForm pricing={pricing} updatePrice={updatePrice} />
    </div>
  );
}
