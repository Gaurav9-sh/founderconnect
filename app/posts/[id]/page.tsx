import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getPost } from '@/services/postService';
import { PostCard } from '@/components/PostCard';
import { Card, CardBody, Avatar } from '@/components/ui/Card';
import { commentAction } from '@/app/actions';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function PostPage({ params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  const post = await getPost(me?.id ?? null, params.id);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/feed" className="text-sm text-zinc-500 hover:underline">
        ← Back to feed
      </Link>

      <PostCard post={post} detail />

      <Card>
        <CardBody>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Comments ({post.comments.length})
          </h2>

          {me ? (
            <form action={commentAction} className="mt-4 flex gap-2">
              <Avatar name={me.name} size={36} />
              <input type="hidden" name="postId" value={post.id} />
              <input
                name="body"
                required
                maxLength={2000}
                placeholder="Add a comment…"
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-800 dark:bg-zinc-900"
              />
              <button type="submit" className="rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700">
                Reply
              </button>
            </form>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">
              <Link href="/login" className="text-brand-600 hover:underline">Log in</Link> to comment.
            </p>
          )}

          <ul className="mt-6 space-y-4">
            {post.comments.length === 0 ? (
              <li className="text-sm text-zinc-500">Be the first to reply.</li>
            ) : (
              post.comments.map((c) => (
                <li key={c.id} className="flex gap-3">
                  <Link href={`/profile/${c.author.id}`}>
                    <Avatar name={c.author.name} url={c.author.profile?.avatarUrl} size={36} />
                  </Link>
                  <div className="min-w-0 flex-1 rounded-xl bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
                    <div className="flex items-baseline gap-2">
                      <Link href={`/profile/${c.author.id}`} className="text-sm font-semibold hover:underline">
                        {c.author.name}
                      </Link>
                      <span className="text-xs text-zinc-500">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
                      {c.body}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
