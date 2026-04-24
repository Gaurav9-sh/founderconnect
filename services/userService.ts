import bcrypt from 'bcryptjs';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { registerSchema, profileSchema } from '@/lib/validation';
import type { Role } from '@/lib/enums';

export async function registerUser(input: unknown) {
  const data = registerSchema.parse(input);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error('Email already in use');
  const passwordHash = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash,
      role: data.role,
      profile: { create: {} },
    },
    select: { id: true, email: true, name: true, role: true },
  });
}

export function getUserWithProfile(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      startups: true,
    },
  });
}

export async function upsertProfile(userId: string, input: unknown) {
  const data = profileSchema.parse(input);
  const cleaned = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === '' ? null : v]),
  ) as Prisma.ProfileUncheckedCreateInput;
  return prisma.profile.upsert({
    where: { userId },
    create: { ...cleaned, userId },
    update: cleaned,
  });
}

export type DiscoveryFilters = {
  role?: Role;
  q?: string;
  skill?: string;
  location?: string;
};

export function discoverUsers(filters: DiscoveryFilters, take = 30) {
  const where: Prisma.UserWhereInput = {};
  if (filters.role) where.role = filters.role;
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q } },
      { profile: { is: { headline: { contains: filters.q } } } },
      { profile: { is: { bio: { contains: filters.q } } } },
    ];
  }
  const profileIs: Prisma.ProfileWhereInput = {};
  if (filters.skill) profileIs.skills = { contains: filters.skill };
  if (filters.location) profileIs.location = { contains: filters.location };
  if (Object.keys(profileIs).length > 0) where.profile = { is: profileIs };

  return prisma.user.findMany({
    where,
    include: { profile: true },
    orderBy: { createdAt: 'desc' },
    take,
  });
}
