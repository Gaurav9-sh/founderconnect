import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { listThread, listThreads, sendMessage } from '@/services/messageService';

export async function GET(req: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const other = searchParams.get('with');
  if (other) return NextResponse.json(await listThread(user.id, other));
  return NextResponse.json(await listThreads(user.id));
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const msg = await sendMessage(user.id, body);
    return NextResponse.json(msg, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    const status = msg === 'UNAUTHORIZED' ? 401 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
