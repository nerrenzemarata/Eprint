import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import PricingForm from './PricingForm';

async function getPricing() {
  const { data } = await supabase
    .from('pricing')
    .select('paperSize,colorMode,pricePerPage,updatedAt')
    .order('colorMode');
  return data ?? [];
}

export async function updatePrice(paperSize: string, colorMode: string, price: number) {
  'use server';
  await supabase
    .from('pricing')
    .update({ pricePerPage: price, updatedAt: new Date().toISOString() })
    .eq('paperSize', paperSize)
    .eq('colorMode', colorMode);
  revalidatePath('/pricing');
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
