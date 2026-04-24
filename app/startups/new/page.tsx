import { redirect } from 'next/navigation';
import { requirePageUser } from '@/lib/auth';
import { createStartupAction } from '@/app/actions';
import { Card, CardBody } from '@/components/ui/Card';
import { Field, Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default async function NewStartupPage() {
  const user = await requirePageUser();
  if (user.role !== 'FOUNDER') redirect('/dashboard');

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Create your pitch</h1>
      <p className="mt-1 text-sm text-zinc-500">
        This is what investors and mentors will see when discovering your startup.
      </p>

      <Card className="mt-6">
        <CardBody>
          <form action={createStartupAction} className="space-y-4">
            <Field name="name" label="Startup name">
              <Input name="name" required minLength={2} />
            </Field>
            <Field name="tagline" label="Tagline" hint="One sentence. What do you do?">
              <Input name="tagline" required maxLength={160} />
            </Field>
            <Field name="description" label="Description">
              <Textarea name="description" required minLength={20} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="category" label="Category">
                <Input name="category" required placeholder="e.g. SaaS, AI, Fintech" />
              </Field>
              <Field name="stage" label="Stage">
                <Select name="stage" defaultValue="IDEA" required>
                  <option value="IDEA">Idea</option>
                  <option value="MVP">MVP</option>
                  <option value="EARLY_TRACTION">Early traction</option>
                  <option value="GROWTH">Growth</option>
                  <option value="SCALING">Scaling</option>
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="location" label="Location">
                <Input name="location" />
              </Field>
              <Field name="website" label="Website">
                <Input name="website" type="url" placeholder="https://" />
              </Field>
            </div>
            <Field name="fundingGoal" label="Funding goal (USD)">
              <Input name="fundingGoal" type="number" min={0} placeholder="e.g. 1000000" />
            </Field>
            <Field name="traction" label="Traction" hint="Numbers, design partners, revenue, waitlist…">
              <Textarea name="traction" />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit">Publish pitch</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
