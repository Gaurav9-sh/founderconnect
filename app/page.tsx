import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect('/feed');

  return (
    <div>
      <section className="py-16 text-center">
        <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-700/20 dark:text-brand-100">
          For founders, mentors, and investors
        </span>
        <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Where first-time founders meet those who&apos;ve done it before.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-600 dark:text-zinc-400">
          FounderConnect is the place to find mentors, pitch your startup, and meet investors — without the noise.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/signup" className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700">
            Get started free
          </Link>
          <Link href="/login" className="rounded-lg border border-zinc-200 px-5 py-2.5 font-medium hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-900">
            Log in
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Feature
          title="For founders"
          body="Share your pitch, find mentors who've scaled companies, and connect with investors actively writing checks."
        />
        <Feature
          title="For mentors & operators"
          body="Help the next wave of founders. Advise, angel-invest, or scout for your next role."
        />
        <Feature
          title="For investors & VCs"
          body="Discover early-stage startups filtered by stage, sector, and geography — with deal flow you won't see elsewhere."
        />
      </section>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{body}</p>
    </div>
  );
}
