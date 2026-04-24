import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { listConnections, listPendingForMe, sendRequest } from '@/services/connectionService';

export async function GET(req: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  if (searchParams.get('pending') === '1') {
    return NextResponse.json(await listPendingForMe(user.id));
  }
  return NextResponse.json(await listConnections(user.id));
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const conn = await sendRequest(user.id, body);
    return NextResponse.json(conn, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    const status = msg === 'UNAUTHORIZED' ? 401 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
