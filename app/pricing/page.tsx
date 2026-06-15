import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
import PricingForm from './PricingForm';
import { updatePrice } from './actions';

async function getPricing() {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('pricing')
    .select('paperSize,colorMode,pricePerPage,updatedAt')
    .order('colorMode');
  return data ?? [];
}

export default async function PricingPage() {
  const pricing = await getPricing();
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black" style={{ color: '#1a2a6c' }}>Pricing</h1>
        <p className="text-sm mt-1" style={{ color: '#6b7a99' }}>
          Changes are picked up by the tablet automatically on next startup or within 5 minutes.
        </p>
      </div>
      <PricingForm pricing={pricing} updatePrice={updatePrice} />
    </div>
  );
}
