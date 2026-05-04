import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { createStartup, listStartups } from '@/services/startupService';
import type { StartupStage } from '@/lib/enums';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startups = await listStartups({
    q: searchParams.get('q') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    stage: (searchParams.get('stage') as StartupStage | null) ?? undefined,
    minFunding: searchParams.get('min') ? Number(searchParams.get('min')) : undefined,
    maxFunding: searchParams.get('max') ? Number(searchParams.get('max')) : undefined,
  });
  return NextResponse.json(startups);
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const startup = await createStartup(user.id, body);
    return NextResponse.json(startup, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    const status = msg === 'UNAUTHORIZED' ? 401 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
