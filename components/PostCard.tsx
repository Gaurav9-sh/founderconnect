import Link from 'next/link';
import { Card, CardBody, Avatar, Badge } from './ui/Card';
import { formatDate, roleLabel } from '@/lib/utils';
import { commentAction, forwardAction, toggleLikeAction } from '@/app/actions';
import type { FeedPost } from '@/services/postService';

type Props = {
  post: FeedPost;
  detail?: boolean; // hide "view all" link and render full body only
};

export function PostCard({ post, detail = false }: Props) {
  const isForward = !!post.originalPost;
  const displayed = post.originalPost ?? post;

  return (
    <Card>
      <CardBody>
        {isForward && (
          <p className="mb-3 text-xs text-zinc-500">
            <Link href={`/profile/${post.author.id}`} className="font-medium text-zinc-700 hover:underline dark:text-zinc-300">
              {post.author.name}
            </Link>{' '}
            reposted
            {post.body && <span className="mt-1 block whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">&ldquo;{post.body}&rdquo;</span>}
          </p>
        )}

        <div className="flex items-start gap-3">
          <Link href={`/profile/${displayed.author.id}`}>
            <Avatar name={displayed.author.name} url={displayed.author.profile?.avatarUrl} size={44} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/profile/${displayed.author.id}`} className="font-semibold hover:underline">
                {displayed.author.name}
              </Link>
              <Badge tone="brand">{roleLabel(displayed.author.role)}</Badge>
              <span className="text-xs text-zinc-500">· {formatDate(displayed.createdAt)}</span>
            </div>
            {displayed.author.profile?.headline && (
              <p className="text-xs text-zinc-500">{displayed.author.profile.headline}</p>
            )}

            {!detail ? (
              <Link href={`/posts/${post.id}`} className="mt-3 block">
                <p className="line-clamp-6 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {displayed.body}
                </p>
              </Link>
            ) : (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                {displayed.body}
              </p>
            )}

            {displayed.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayed.imageUrl}
                alt=""
                className="mt-3 max-h-96 w-full rounded-lg object-cover"
              />
            )}

            <div className="mt-4 flex items-center gap-1 border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <form action={toggleLikeAction}>
                <input type="hidden" name="postId" value={post.id} />
                <button
                  type="submit"
                  className={
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ' +
                    (post.likedByMe ? 'text-brand-600 font-medium' : 'text-zinc-600 dark:text-zinc-300')
                  }
                  aria-pressed={post.likedByMe}
                >
                  <span aria-hidden>{post.likedByMe ? '♥' : '♡'}</span>
                  <span>{post._count.likes}</span>
                  <span className="hidden sm:inline">Like</span>
                </button>
              </form>

              <Link
                href={`/posts/${post.id}`}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <span aria-hidden>💬</span>
                <span>{post._count.comments}</span>
                <span className="hidden sm:inline">Comment</span>
              </Link>

              <form action={forwardAction}>
                <input type="hidden" name="postId" value={post.id} />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <span aria-hidden>↗</span>
                  <span>{post._count.forwards}</span>
                  <span className="hidden sm:inline">Forward</span>
                </button>
              </form>
            </div>

            {!detail && (
              <form action={commentAction} className="mt-3 flex gap-2">
                <input type="hidden" name="postId" value={post.id} />
                <input
                  name="body"
                  required
                  maxLength={2000}
                  placeholder="Write a comment…"
                  className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-800 dark:bg-zinc-900"
                />
                <button type="submit" className="rounded-lg bg-brand-600 px-3 text-sm font-medium text-white hover:bg-brand-700">
                  Reply
                </button>
              </form>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
