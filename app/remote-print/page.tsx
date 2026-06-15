import { getSupabase } from '@/lib/supabase';
import RemotePrintClient from './RemotePrintClient';

export const dynamic = 'force-dynamic';

async function getTunnelUrl(): Promise<string | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('devices')
    .select('tunnel_url')
    .order('lastSeen', { ascending: false })
    .limit(1)
    .single();
  return (data as any)?.tunnel_url ?? null;
}

export default async function RemotePrintPage() {
  const tunnelUrl = await getTunnelUrl();
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black" style={{ color: '#1a2a6c' }}>Remote Print</h1>
        <p className="text-sm mt-1" style={{ color: '#6b7a99' }}>
          Upload a file — it prints on the kiosk immediately, no payment required.
        </p>
      </div>
      <RemotePrintClient tunnelUrl={tunnelUrl} />
    </div>
  );
}
