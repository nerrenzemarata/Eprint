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
      <h1 className="text-2xl font-bold mb-2">Pricing</h1>
      <p className="text-gray-500 text-sm mb-8">
        Changes are picked up by the tablet automatically on next startup or within 5 minutes.
      </p>
      <PricingForm pricing={pricing} updatePrice={updatePrice} />
    </div>
  );
}
