'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Input';

export default function SignupPage() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get('name')),
      email: String(fd.get('email')),
      password: String(fd.get('password')),
      role: String(fd.get('role')),
    };
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setLoading(false);
      return setErr(typeof body.error === 'string' ? body.error : 'Signup failed');
    }
    await signIn('credentials', {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="mx-auto mt-10 max-w-md">
      <Card>
        <CardBody>
          <h1 className="text-xl font-semibold">Join FounderConnect</h1>
          <p className="mt-1 text-sm text-zinc-500">Takes less than a minute.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field name="name" label="Full name">
              <Input id="name" name="name" required />
            </Field>
            <Field name="email" label="Email">
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </Field>
            <Field name="password" label="Password" hint="At least 8 characters">
              <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
            </Field>
            <Field name="role" label="I am a…">
              <Select id="role" name="role" defaultValue="FOUNDER" required>
                <option value="FOUNDER">Founder (early stage)</option>
                <option value="MENTOR">Experienced founder / CEO / mentor</option>
                <option value="INVESTOR">Investor / VC</option>
              </Select>
            </Field>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-brand-600 hover:underline">
              Log in
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
