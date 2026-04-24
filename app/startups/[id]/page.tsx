import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getStartup } from '@/services/startupService';
import { Card, CardBody, Badge, Avatar } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { expressInterestAction } from '@/app/actions';
import { formatMoney, stageLabel } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function StartupPage({ params }: { params: { id: string } }) {
  const [me, startup] = await Promise.all([getCurrentUser(), getStartup(params.id)]);
  if (!startup) notFound();

  const alreadyInterested = me
    ? startup.interests.some((i) => i.investorId === me.id)
    : false;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardBody>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-semibold">{startup.name}</h1>
                  <Badge tone="brand">{stageLabel(startup.stage)}</Badge>
                </div>
                <p className="mt-1 text-lg text-zinc-700 dark:text-zinc-300">{startup.tagline}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Badge>{startup.category}</Badge>
                  {startup.location && <Badge>{startup.location}</Badge>}
                  {startup.website && (
                    <a href={startup.website} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                      {startup.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">About</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {startup.description}
              </p>
            </div>

            {startup.traction && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Traction</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{startup.traction}</p>
              </div>
            )}
          </CardBody>
        </Card>

        {me?.role === 'INVESTOR' && !alreadyInterested && (
          <Card>
            <CardBody>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Express interest</h2>
              <p className="mt-1 text-sm text-zinc-500">
                The founder will be notified and can reply to schedule a call.
              </p>
              <form action={expressInterestAction} className="mt-3 space-y-3">
                <input type="hidden" name="startupId" value={startup.id} />
                <Textarea name="note" placeholder="Optional: a short note…" />
                <Button type="submit">I&apos;m interested</Button>
              </form>
            </CardBody>
          </Card>
        )}

        {me?.role === 'INVESTOR' && alreadyInterested && (
          <Card>
            <CardBody className="flex items-center justify-between">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                You&apos;ve expressed interest in {startup.name}.
              </p>
              <Link href={`/messages/${startup.founder.id}`}>
                <Button variant="secondary" size="sm">Message founder</Button>
              </Link>
            </CardBody>
          </Card>
        )}
      </div>

      <aside className="space-y-4">
        <Card>
          <CardBody>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Raising</h3>
            <p className="mt-2 text-2xl font-semibold">{formatMoney(startup.fundingGoal)}</p>
            {startup.raisedAmount && startup.raisedAmount > 0 && (
              <p className="text-xs text-zinc-500">Raised so far: {formatMoney(startup.raisedAmount)}</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Founder</h3>
            <Link href={`/profile/${startup.founder.id}`} className="mt-3 flex items-center gap-3 hover:opacity-80">
              <Avatar name={startup.founder.name} url={startup.founder.profile?.avatarUrl} size={44} />
              <div>
                <p className="font-medium">{startup.founder.name}</p>
                {startup.founder.profile?.headline && (
                  <p className="text-xs text-zinc-500">{startup.founder.profile.headline}</p>
                )}
              </div>
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Interest ({startup.interests.length})
            </h3>
            {startup.interests.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">Be the first investor to express interest.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {startup.interests.map((i) => (
                  <li key={i.id}>
                    <Link href={`/profile/${i.investor.id}`} className="flex items-center gap-2 text-sm hover:underline">
                      <Avatar name={i.investor.name} url={i.investor.profile?.avatarUrl} size={28} />
                      <span>{i.investor.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </aside>
    </div>
  );
}
