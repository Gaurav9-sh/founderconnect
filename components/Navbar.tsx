import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { unreadCount } from '@/services/notificationService';
import { SignOutButton } from './SignOutButton';
import { Avatar } from './ui/Card';

export async function Navbar() {
  const user = await getCurrentUser();
  const unread = user ? await unreadCount(user.id) : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            FC
          </span>
          <span className="hidden sm:block">FounderConnect</span>
        </Link>

        {user && (
          <nav className="flex items-center gap-1 text-sm">
            <NavLink href="/feed">Feed</NavLink>
            <NavLink href="/startups">Startups</NavLink>
            <NavLink href="/connections">
              Network {unread > 0 && <span className="ml-1 rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] text-white">{unread}</span>}
            </NavLink>
            <NavLink href="/messages">Messages</NavLink>
            <NavLink href="/dashboard">Dashboard</NavLink>
          </nav>
        )}

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href={`/profile/${user.id}`} className="flex items-center gap-2">
                <Avatar name={user.name} size={32} />
                <span className="hidden text-sm font-medium sm:block">{user.name.split(' ')[0]}</span>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">
                Log in
              </Link>
              <Link href="/signup" className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {children}
    </Link>
  );
}
