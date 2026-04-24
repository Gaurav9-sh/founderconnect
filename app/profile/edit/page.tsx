import { requirePageUser } from '@/lib/auth';
import { getUserWithProfile } from '@/services/userService';
import { saveProfileAction } from '@/app/actions';
import { Card, CardBody } from '@/components/ui/Card';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function EditProfilePage() {
  const user = await requirePageUser();
  const full = await getUserWithProfile(user.id);
  const p = full?.profile;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Edit your profile</h1>
      <p className="mt-1 text-sm text-zinc-500">
        A complete profile gets 5× more connection requests.
      </p>

      <Card className="mt-6">
        <CardBody>
          <form action={saveProfileAction} className="space-y-4">
            <Field name="headline" label="Headline">
              <Input name="headline" defaultValue={p?.headline ?? ''} placeholder="Building X for Y" />
            </Field>
            <Field name="bio" label="Bio">
              <Textarea name="bio" defaultValue={p?.bio ?? ''} placeholder="Tell your story…" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="location" label="Location">
                <Input name="location" defaultValue={p?.location ?? ''} />
              </Field>
              <Field name="skills" label="Skills" hint="Comma-separated">
                <Input name="skills" defaultValue={p?.skills ?? ''} placeholder="TypeScript, React, Fundraising" />
              </Field>
            </div>
            <Field name="experience" label="Experience">
              <Textarea name="experience" defaultValue={p?.experience ?? ''} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field name="website" label="Website">
                <Input name="website" type="url" defaultValue={p?.website ?? ''} placeholder="https://" />
              </Field>
              <Field name="linkedin" label="LinkedIn">
                <Input name="linkedin" type="url" defaultValue={p?.linkedin ?? ''} placeholder="https://linkedin.com/in/…" />
              </Field>
              <Field name="twitter" label="Twitter / X">
                <Input name="twitter" type="url" defaultValue={p?.twitter ?? ''} placeholder="https://x.com/…" />
              </Field>
            </div>

            {user.role === 'INVESTOR' && (
              <>
                <h3 className="pt-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Investor profile</h3>
                <Field name="investmentFocus" label="Investment focus" hint="Comma-separated">
                  <Input name="investmentFocus" defaultValue={p?.investmentFocus ?? ''} placeholder="SaaS, AI, Fintech" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field name="checkSizeMin" label="Min check size (USD)">
                    <Input name="checkSizeMin" type="number" defaultValue={p?.checkSizeMin ?? ''} />
                  </Field>
                  <Field name="checkSizeMax" label="Max check size (USD)">
                    <Input name="checkSizeMax" type="number" defaultValue={p?.checkSizeMax ?? ''} />
                  </Field>
                </div>
              </>
            )}

            {user.role === 'MENTOR' && (
              <>
                <h3 className="pt-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Mentor profile</h3>
                <Field name="mentorshipAreas" label="Mentorship areas" hint="Comma-separated">
                  <Input name="mentorshipAreas" defaultValue={p?.mentorshipAreas ?? ''} placeholder="GTM, Hiring, Fundraising" />
                </Field>
              </>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit">Save profile</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
