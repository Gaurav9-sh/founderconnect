import clsx, { type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function formatMoney(n?: number | null): string {
  if (!n || n <= 0) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

export function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const diff = Date.now() - date.getTime();
  const min = 60_000;
  const hr = 60 * min;
  const day = 24 * hr;
  if (diff < min) return 'just now';
  if (diff < hr) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hr)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return date.toLocaleDateString();
}

export function splitList(s?: string | null): string[] {
  if (!s) return [];
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

export function stageLabel(stage: string): string {
  return {
    IDEA: 'Idea',
    MVP: 'MVP',
    EARLY_TRACTION: 'Early Traction',
    GROWTH: 'Growth',
    SCALING: 'Scaling',
  }[stage] ?? stage;
}

export function roleLabel(role: string): string {
  return {
    FOUNDER: 'Founder',
    INVESTOR: 'Investor',
    MENTOR: 'Mentor',
  }[role] ?? role;
}

