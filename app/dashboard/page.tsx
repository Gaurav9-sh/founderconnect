import Link from 'next/link';
import { requirePageUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { listPendingForMe, listConnections } from '@/services/connectionService';
import { listThreads } from '@/services/messageService';
import { Card, CardBody, Badge, Avatar } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StartupCard } from '@/components/StartupCard';
import { respondConnectionAction } from '../actions';
import { formatMoney, roleLabel } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await requirePageUser();

  const [pending, connections, threads, myStartups, myInterests] =
    await Promise.all([
      listPendingForMe(user.id),
      listConnections(user.id),
      listThreads(user.id),
      user.role === 'FOUNDER'
        ? prisma.startup.findMany({
            where: { founderId: user.id },
            include: { interests: true },
            orderBy: { createdAt: 'desc' },
          })
        : Promise.resolve([]),
      user.role === 'INVESTOR'
        ? prisma.pitchInterest.findMany({
            where: { investorId: user.id },
            include: { startup: { include: { founder: true } } },
            orderBy: { createdAt: 'desc' },
          })
        : Promise.resolve([]),
    ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">
          Welcome back, {user.name.split(' ')[0]}
        </h1>
        <p className="text-sm text-zinc-500">
          You&apos;re signed in as <Badge tone="brand">{roleLabel(user.role)}</Badge>
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Connections" value={connections.length} href="/connections" />
        <Stat label="Pending requests" value={pending.length} href="/connections?tab=pending" />
        <Stat label="Active threads" value={threads.length} href="/messages" />
      </section>

      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Connection requests</h2>
          <div className="space-y-3">
            {pending.map((c) => (
              <Card key={c.id}>
                <CardBody className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={c.requester.name} url={c.requester.profile?.avatarUrl} size={40} />
                    <div>
                      <Link href={`/profile/${c.requester.id}`} className="font-medium hover:underline">
                        {c.requester.name}
                      </Link>
                      <p className="text-xs text-zinc-500">{c.requester.profile?.headline ?? ''}</p>
                      {c.message && <p className="mt-1 text-sm">&ldquo;{c.message}&rdquo;</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <form action={respondConnectionAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="accept" value="true" />
                      <Button size="sm">Accept</Button>
                    </form>
                    <form action={respondConnectionAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="accept" value="false" />
                      <Button size="sm" variant="secondary">
                        Decline
                      </Button>
                    </form>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      )}

      {user.role === 'FOUNDER' && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your startups</h2>
            <Link href="/startups/new">
              <Button size="sm">+ New startup</Button>
            </Link>
          </div>
          {myStartups.length === 0 ? (
            <p className="text-sm text-zinc-500">
              You haven&apos;t created a startup yet.{' '}
              <Link href="/startups/new" className="text-brand-600 hover:underline">
                Create your first pitch
              </Link>
              .
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {myStartups.map((s) => (
                <div key={s.id} className="space-y-2">
                  <StartupCard startup={s} />
                  <p className="px-1 text-xs text-zinc-500">
                    {s.interests.length} investor{s.interests.length === 1 ? '' : 's'} interested
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {user.role === 'INVESTOR' && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Your saved deals</h2>
          {myInterests.length === 0 ? (
            <p className="text-sm text-zinc-500">
              You haven&apos;t saved any startups.{' '}
              <Link href="/startups" className="text-brand-600 hover:underline">
                Browse startups
              </Link>
              .
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {myInterests.map((i) => (
                <Card key={i.id}>
                  <CardBody>
                    <Link href={`/startups/${i.startup.id}`} className="font-semibold hover:underline">
                      {i.startup.name}
                    </Link>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{i.startup.tagline}</p>
                    <div className="mt-2 flex gap-2 text-xs">
                      <Badge>{i.startup.category}</Badge>
                      {i.startup.fundingGoal && <Badge tone="green">{formatMoney(i.startup.fundingGoal)}</Badge>}
                      <Badge tone="amber">{i.status}</Badge>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {user.role === 'MENTOR' && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Your network</h2>
          {connections.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No connections yet.{' '}
              <Link href="/feed" className="text-brand-600 hover:underline">
                Discover founders
              </Link>
              .
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {connections.slice(0, 6).map((c) => {
                const other = c.requesterId === user.id ? c.receiver : c.requester;
                return (
                  <Card key={c.id}>
                    <CardBody className="flex items-center gap-3">
                      <Avatar name={other.name} url={other.profile?.avatarUrl} size={40} />
                      <div>
                        <Link href={`/profile/${other.id}`} className="font-medium hover:underline">
                          {other.name}
                        </Link>
                        <p className="text-xs text-zinc-500">{other.profile?.headline ?? ''}</p>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href}>
      <Card className="transition hover:shadow-md">
        <CardBody>
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="mt-1 text-3xl font-semibold">{value}</p>
        </CardBody>
      </Card>
    </Link>
  );
}
