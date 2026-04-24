import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { getStartup, updateStartup } from '@/services/startupService';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const s = await getStartup(params.id);
  if (!s) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(s);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const updated = await updateStartup(user.id, params.id, body);
    return NextResponse.json(updated);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    const status = msg === 'UNAUTHORIZED' ? 401 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
