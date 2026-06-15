import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const { password } = await req.json();

  if (!password || password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const supabase = getSupabase();

  // Only allow setup if no password is set yet
  const { data: existing } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', 'admin_password')
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Already set up' }, { status: 403 });
  }

  await supabase
    .from('admin_settings')
    .insert({ key: 'admin_password', value: password });

  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_session', 'logged_in', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}
