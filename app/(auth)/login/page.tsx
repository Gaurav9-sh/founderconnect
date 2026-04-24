'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      email: String(fd.get('email')),
      password: String(fd.get('password')),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) return setErr('Invalid credentials');
    router.push(params.get('callbackUrl') ?? '/feed');
    router.refresh();
  }

  return (
    <div className="mx-auto mt-10 max-w-md">
      <Card>
        <CardBody>
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-zinc-500">Log in to your FounderConnect account.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field name="email" label="Email">
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </Field>
            <Field name="password" label="Password">
              <Input id="password" name="password" type="password" required autoComplete="current-password" />
            </Field>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            New here?{' '}
            <Link href="/signup" className="font-medium text-brand-600 hover:underline">
              Create an account
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
