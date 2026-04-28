import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requirePageUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models';
import type { UserWithProfile } from '@/types/models';
import { listThread, markThreadRead } from '@/services/messageService';
import { connectionBetween } from '@/services/connectionService';
import { sendMessageAction } from '@/app/actions';
import { Card, CardBody, Avatar } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ThreadPage({ params }: { params: { userId: string } }) {
  const user = await requirePageUser();
  await connectDB();
  const other = (await User.findById(params.userId)
    .populate('profile')
    .lean({ virtuals: true })) as unknown as UserWithProfile | null;
  if (!other) notFound();

  const conn = await connectionBetween(user.id, other.id);
  const canMessage = conn?.status === 'ACCEPTED';

  await markThreadRead(user.id, other.id);
  const messages = await listThread(user.id, other.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/messages" className="text-sm text-zinc-500 hover:underline">
        ← Back to messages
      </Link>

      <Card className="mt-3">
        <div className="flex items-center gap-3 border-b border-zinc-200 p-4 dark:border-zinc-800">
          <Avatar name={other.name} url={other.profile?.avatarUrl} size={40} />
          <div>
            <Link href={`/profile/${other.id}`} className="font-semibold hover:underline">
              {other.name}
            </Link>
            {other.profile?.headline && (
              <p className="text-xs text-zinc-500">{other.profile.headline}</p>
            )}
          </div>
        </div>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-500">
              {canMessage ? 'Say hi 👋' : 'You must be connected to exchange messages.'}
            </p>
          ) : (
            messages.map((m) => {
              const mine = m.senderId === user.id;
              return (
                <div key={m.id} className={mine ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={
                      mine
                        ? 'max-w-[75%] rounded-2xl rounded-br-sm bg-brand-600 px-3.5 py-2 text-sm text-white'
                        : 'max-w-[75%] rounded-2xl rounded-bl-sm bg-zinc-100 px-3.5 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                    }
                  >
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <p className={mine ? 'mt-1 text-[10px] text-brand-100' : 'mt-1 text-[10px] text-zinc-500'}>
                      {formatDate(m.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {canMessage && (
          <form action={sendMessageAction} className="flex items-end gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
            <input type="hidden" name="receiverId" value={other.id} />
            <Textarea name="body" required placeholder="Write a message…" className="min-h-[60px] flex-1" />
            <Button type="submit">Send</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
