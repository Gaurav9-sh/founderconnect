import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getUserWithProfile } from '@/services/userService';
import { connectionBetween } from '@/services/connectionService';
import { Card, CardBody, Badge, Avatar } from '@/components/ui/Card';
import { ConnectButton } from '@/components/ConnectButton';
import type { ConnectionStatus } from '@/lib/enums';
import { Button } from '@/components/ui/Button';
import { StartupCard } from '@/components/StartupCard';
import { formatMoney, roleLabel, splitList } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const [me, user] = await Promise.all([
    getCurrentUser(),
    getUserWithProfile(params.id),
  ]);
  if (!user) notFound();

  const isMe = me?.id === user.id;
  const conn = me && !isMe ? await connectionBetween(me.id, user.id) : null;

  const skills = splitList(user.profile?.skills);
  const focus = splitList(user.profile?.investmentFocus);
  const mentorAreas = splitList(user.profile?.mentorshipAreas);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardBody>
            <div className="flex items-start gap-4">
              <Avatar name={user.name} url={user.profile?.avatarUrl} size={80} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold">{user.name}</h1>
                  <Badge tone="brand">{roleLabel(user.role)}</Badge>
                </div>
                {user.profile?.headline && (
                  <p className="mt-1 text-zinc-700 dark:text-zinc-300">{user.profile.headline}</p>
                )}
                {user.profile?.location && (
                  <p className="mt-1 text-sm text-zinc-500">{user.profile.location}</p>
                )}
                <div className="mt-4 flex items-center gap-2">
                  {isMe ? (
                    <Link href="/profile/edit">
                      <Button variant="secondary" size="sm">Edit profile</Button>
                    </Link>
                  ) : me ? (
                    <>
                      <ConnectButton receiverId={user.id} status={(conn?.status as ConnectionStatus | undefined) ?? null} />
                      {conn?.status === 'ACCEPTED' && (
                        <Link href={`/messages/${user.id}`}>
                          <Button variant="secondary" size="sm">Message</Button>
                        </Link>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            {user.profile?.bio && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">About</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                  {user.profile.bio}
                </p>
              </div>
            )}

            {user.profile?.experience && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Experience</h2>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{user.profile.experience}</p>
              </div>
            )}

            {skills.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Skills</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {user.role === 'FOUNDER' && user.startups.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-lg font-semibold">Startups</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {user.startups.map((s) => (
                <StartupCard key={s.id} startup={s} />
              ))}
            </div>
          </section>
        )}
      </div>

      <aside className="space-y-4">
        {user.role === 'INVESTOR' && (
          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Investment profile</h3>
              <dl className="mt-3 space-y-2 text-sm">
                {focus.length > 0 && (
                  <div>
                    <dt className="text-zinc-500">Focus</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {focus.map((f) => (
                        <Badge key={f}>{f}</Badge>
                      ))}
                    </dd>
                  </div>
                )}
                {(user.profile?.checkSizeMin || user.profile?.checkSizeMax) && (
                  <div>
                    <dt className="text-zinc-500">Check size</dt>
                    <dd className="mt-1 font-medium">
                      {formatMoney(user.profile?.checkSizeMin)} – {formatMoney(user.profile?.checkSizeMax)}
                    </dd>
                  </div>
                )}
              </dl>
            </CardBody>
          </Card>
        )}

        {user.role === 'MENTOR' && mentorAreas.length > 0 && (
          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Mentorship areas</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {mentorAreas.map((a) => (
                  <Badge key={a}>{a}</Badge>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {(user.profile?.website || user.profile?.linkedin || user.profile?.twitter) && (
          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Links</h3>
              <ul className="mt-3 space-y-1 text-sm">
                {user.profile?.website && (
                  <li><a className="text-brand-600 hover:underline" href={user.profile.website} target="_blank" rel="noreferrer">Website</a></li>
                )}
                {user.profile?.linkedin && (
                  <li><a className="text-brand-600 hover:underline" href={user.profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
                )}
                {user.profile?.twitter && (
                  <li><a className="text-brand-600 hover:underline" href={user.profile.twitter} target="_blank" rel="noreferrer">Twitter / X</a></li>
                )}
              </ul>
            </CardBody>
          </Card>
        )}
      </aside>
    </div>
  );
}
