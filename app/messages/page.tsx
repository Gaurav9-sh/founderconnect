import Link from 'next/link';
import { requirePageUser } from '@/lib/auth';
import { listThreads } from '@/services/messageService';
import { Card, CardBody, Avatar } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const user = await requirePageUser();
  const threads = await listThreads(user.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Messages</h1>
      {threads.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
          You have no messages yet. You can message anyone you&apos;re connected with.
        </p>
      ) : (
        <div className="mt-6 space-y-2">
          {threads.map((t) => (
            <Link key={t.otherId} href={`/messages/${t.otherId}`}>
              <Card className="transition hover:shadow-md">
                <CardBody className="flex items-center gap-3">
                  <Avatar name={t.otherName} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium">{t.otherName}</p>
                      <span className="text-xs text-zinc-500">{formatDate(t.at)}</span>
                    </div>
                    <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">{t.last}</p>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
