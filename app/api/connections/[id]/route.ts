import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { respondToRequest } from '@/services/connectionService';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireUser();
    const { accept } = (await req.json()) as { accept: boolean };
    const conn = await respondToRequest(user.id, params.id, !!accept);
    return NextResponse.json(conn);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    const status = msg === 'UNAUTHORIZED' ? 401 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
