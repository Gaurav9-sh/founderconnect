import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { upsertProfile } from '@/services/userService';

export async function PUT(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const profile = await upsertProfile(user.id, body);
    return NextResponse.json(profile);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    const status = msg === 'UNAUTHORIZED' ? 401 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
