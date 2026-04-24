import Link from 'next/link';
import type { Startup } from '@prisma/client';
import { Badge, Card, CardBody } from './ui/Card';
import { formatMoney, stageLabel } from '@/lib/utils';

type WithFounder = Startup & { founder?: { id: string; name: string } | null };

export function StartupCard({ startup }: { startup: WithFounder }) {
  return (
    <Card className="transition hover:shadow-md">
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/startups/${startup.id}`} className="text-lg font-semibold hover:underline">
              {startup.name}
            </Link>
            <p className="mt-0.5 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
              {startup.tagline}
            </p>
          </div>
          <Badge tone="brand">{stageLabel(startup.stage)}</Badge>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
          <Badge>{startup.category}</Badge>
          {startup.location && <Badge>{startup.location}</Badge>}
          {startup.fundingGoal ? (
            <Badge tone="green">Raising {formatMoney(startup.fundingGoal)}</Badge>
          ) : null}
        </div>
        {startup.founder && (
          <p className="mt-3 text-xs text-zinc-500">
            by{' '}
            <Link href={`/profile/${startup.founder.id}`} className="font-medium text-zinc-700 hover:underline dark:text-zinc-300">
              {startup.founder.name}
            </Link>
          </p>
        )}
      </CardBody>
    </Card>
  );
}
