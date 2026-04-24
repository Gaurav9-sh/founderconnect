import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { expressInterest } from '@/services/startupService';

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireUser();
    if (user.role !== 'INVESTOR')
      return NextResponse.json({ error: 'Only investors can express interest' }, { status: 403 });
    const { note } = (await req.json().catch(() => ({}))) as { note?: string };
    const interest = await expressInterest(user.id, params.id, note);
    return NextResponse.json(interest, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    const status = msg === 'UNAUTHORIZED' ? 401 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
