import Link from 'next/link';
import type { Profile, User } from '@/types/models';
import { Avatar, Badge, Card, CardBody } from './ui/Card';
import { roleLabel, splitList } from '@/lib/utils';

type UserWithProfile = User & { profile: Profile | null };

export function PersonCard({ user }: { user: UserWithProfile }) {
  const skills = splitList(user.profile?.skills);
  return (
    <Card className="transition hover:shadow-md">
      <CardBody>
        <div className="flex items-start gap-3">
          <Avatar name={user.name} url={user.profile?.avatarUrl} size={48} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <Link href={`/profile/${user.id}`} className="truncate font-semibold hover:underline">
                {user.name}
              </Link>
              <Badge tone="brand">{roleLabel(user.role)}</Badge>
            </div>
            {user.profile?.headline && (
              <p className="mt-0.5 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                {user.profile.headline}
              </p>
            )}
            {user.profile?.location && (
              <p className="mt-1 text-xs text-zinc-500">{user.profile.location}</p>
            )}
            {skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {skills.slice(0, 4).map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
