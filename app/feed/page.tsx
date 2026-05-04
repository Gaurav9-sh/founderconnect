import { Suspense } from 'react';
import { requirePageUser } from '@/lib/auth';
import { discoverUsers } from '@/services/userService';
import { listStartups } from '@/services/startupService';
import { listFeed } from '@/services/postService';
import { PersonCard } from '@/components/PersonCard';
import { StartupCard } from '@/components/StartupCard';
import { PostCard } from '@/components/PostCard';
import { PostComposer } from '@/components/PostComposer';
import { Input } from '@/components/ui/Input';

export const dynamic = 'force-dynamic';

type Props = { searchParams: { q?: string; tab?: string } };

export default async function FeedPage({ searchParams }: Props) {
  const me = await requirePageUser();
  const tab = searchParams.tab ?? 'posts';

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Feed</h1>
        <div className="flex gap-2">
          <TabLink label="Posts" href={`/feed?tab=posts`} active={tab === 'posts'} />
          <TabLink label="People" href={`/feed?tab=people`} active={tab === 'people'} />
          <TabLink label="Startups" href={`/feed?tab=startups`} active={tab === 'startups'} />
        </div>
      </div>

      {tab === 'posts' ? (
        <div className="mt-6 mx-auto max-w-2xl space-y-4">
          <PostComposer authorName={me.name} />
          <Suspense fallback={<p className="text-sm text-zinc-500">Loading posts…</p>}>
            <PostsList viewerId={me.id} />
          </Suspense>
        </div>
      ) : (
        <>
          <form className="mt-6 flex flex-wrap gap-3" action="/feed">
            <input type="hidden" name="tab" value={tab} />
            <Input
              name="q"
              placeholder={tab === 'people' ? 'Search people by name, skill, headline…' : 'Search startups…'}
              defaultValue={searchParams.q ?? ''}
              className="max-w-sm"
            />
            <button className="rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700">
              Search
            </button>
          </form>

          <Suspense fallback={<p className="mt-8 text-sm text-zinc-500">Loading…</p>}>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tab === 'people' ? (
                <PeopleList q={searchParams.q} />
              ) : (
                <StartupsList q={searchParams.q} />
              )}
            </div>
          </Suspense>
        </>
      )}
    </div>
  );
}

async function PostsList({ viewerId }: { viewerId: string }) {
  const posts = await listFeed(viewerId);
  if (posts.length === 0) {
    return <EmptyState text="No posts yet. Be the first to share something." />;
  }
  return (
    <>
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </>
  );
}

async function PeopleList({ q }: { q?: string }) {
  const users = await discoverUsers({ q });
  if (users.length === 0) {
    return <EmptyState text="No people match your filters yet." />;
  }
  return (
    <>
      {users.map((u) => (
        <PersonCard key={u.id} user={u} />
      ))}
    </>
  );
}

async function StartupsList({ q }: { q?: string }) {
  const startups = await listStartups({ q });
  if (startups.length === 0) {
    return <EmptyState text="No startups match your filters yet." />;
  }
  return (
    <>
      {startups.map((s) => (
        <StartupCard key={s.id} startup={s} />
      ))}
    </>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="col-span-full rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
      {text}
    </div>
  );
}

function TabLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <a
      href={href}
      className={
        active
          ? 'rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-zinc-900'
          : 'rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
      }
    >
      {label}
    </a>
  );
}
