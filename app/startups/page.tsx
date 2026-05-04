import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { listStartups } from '@/services/startupService';
import { StartupCard } from '@/components/StartupCard';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { StartupStage } from '@/lib/enums';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: { q?: string; category?: string; stage?: StartupStage };
};

const CATEGORIES = ['SaaS', 'DevTools', 'AI', 'Fintech', 'Health', 'Consumer', 'Marketplace'];

export default async function StartupsPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  const startups = await listStartups({
    q: searchParams.q,
    category: searchParams.category,
    stage: searchParams.stage,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Startups</h1>
        {user && (
          <Link href="/startups/new">
            <Button>+ Create pitch</Button>
          </Link>
        )}
      </div>

      <form className="mt-6 flex flex-wrap gap-3" action="/startups">
        <Input name="q" placeholder="Search startups…" defaultValue={searchParams.q ?? ''} className="max-w-sm" />
        <Select name="category" defaultValue={searchParams.category ?? ''} className="max-w-xs">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select name="stage" defaultValue={searchParams.stage ?? ''} className="max-w-xs">
          <option value="">All stages</option>
          <option value="IDEA">Idea</option>
          <option value="MVP">MVP</option>
          <option value="EARLY_TRACTION">Early traction</option>
          <option value="GROWTH">Growth</option>
          <option value="SCALING">Scaling</option>
        </Select>
        <Button type="submit">Filter</Button>
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {startups.length === 0 ? (
          <p className="col-span-full rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
            No startups match these filters.
          </p>
        ) : (
          startups.map((s) => <StartupCard key={s.id} startup={s} />)
        )}
      </div>
    </div>
  );
}
