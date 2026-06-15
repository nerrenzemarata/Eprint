'use server';

import { getSupabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function updatePrice(paperSize: string, colorMode: string, price: number) {
  const supabase = getSupabase();
  await supabase
    .from('pricing')
    .update({ pricePerPage: price, updatedAt: new Date().toISOString() })
    .eq('paperSize', paperSize)
    .eq('colorMode', colorMode);
  revalidatePath('/pricing');
}
