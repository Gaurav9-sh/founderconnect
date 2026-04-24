import Link from 'next/link';
import { requirePageUser } from '@/lib/auth';
import { listConnections, listPendingForMe } from '@/services/connectionService';
import { Card, CardBody, Avatar, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { respondConnectionAction } from '@/app/actions';
import { roleLabel } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ConnectionsPage({ searchParams }: { searchParams: { tab?: string } }) {
  const user = await requirePageUser();
  const tab = searchParams.tab === 'pending' ? 'pending' : 'connections';

  const [connections, pending] = await Promise.all([
    listConnections(user.id),
    listPendingForMe(user.id),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your network</h1>
        <div className="flex gap-2">
          <TabLink label={`Connections (${connections.length})`} href="/connections" active={tab === 'connections'} />
          <TabLink label={`Requests (${pending.length})`} href="/connections?tab=pending" active={tab === 'pending'} />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {tab === 'connections' &&
          (connections.length === 0 ? (
            <EmptyState text="No connections yet. Head to the feed to find people." />
          ) : (
            connections.map((c) => {
              const other = c.requesterId === user.id ? c.receiver : c.requester;
              return (
                <Card key={c.id}>
                  <CardBody className="flex items-center justify-between gap-3">
                    <Link href={`/profile/${other.id}`} className="flex min-w-0 items-center gap-3">
                      <Avatar name={other.name} url={other.profile?.avatarUrl} size={44} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium">{other.name}</p>
                          <Badge tone="brand">{roleLabel(other.role)}</Badge>
                        </div>
                        <p className="truncate text-sm text-zinc-500">{other.profile?.headline ?? ''}</p>
                      </div>
                    </Link>
                    <Link href={`/messages/${other.id}`}>
                      <Button variant="secondary" size="sm">Message</Button>
                    </Link>
                  </CardBody>
                </Card>
              );
            })
          ))}

        {tab === 'pending' &&
          (pending.length === 0 ? (
            <EmptyState text="No pending requests." />
          ) : (
            pending.map((c) => (
              <Card key={c.id}>
                <CardBody className="flex items-center justify-between gap-3">
                  <Link href={`/profile/${c.requester.id}`} className="flex items-center gap-3">
                    <Avatar name={c.requester.name} url={c.requester.profile?.avatarUrl} size={44} />
                    <div>
                      <p className="font-medium">{c.requester.name}</p>
                      <p className="text-xs text-zinc-500">{c.requester.profile?.headline ?? ''}</p>
                      {c.message && <p className="mt-1 text-sm">&ldquo;{c.message}&rdquo;</p>}
                    </div>
                  </Link>
                  <div className="flex gap-2">
                    <form action={respondConnectionAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="accept" value="true" />
                      <Button size="sm">Accept</Button>
                    </form>
                    <form action={respondConnectionAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="accept" value="false" />
                      <Button size="sm" variant="secondary">Decline</Button>
                    </form>
                  </div>
                </CardBody>
              </Card>
            ))
          ))}
      </div>
    </div>
  );
}

function TabLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={
        active
          ? 'rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-zinc-900'
          : 'rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
      }
    >
      {label}
    </Link>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
      {text}
    </div>
  );
}
