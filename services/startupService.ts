import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { startupSchema } from '@/lib/validation';
import type { StartupStage } from '@/lib/enums';

export async function createStartup(founderId: string, input: unknown) {
  const data = startupSchema.parse(input);
  return prisma.startup.create({
    data: {
      founderId,
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      category: data.category,
      stage: data.stage,
      location: data.location ?? null,
      website: data.website || null,
      fundingGoal: data.fundingGoal ?? null,
      traction: data.traction ?? null,
    },
  });
}

export async function updateStartup(
  founderId: string,
  id: string,
  input: unknown,
) {
  const data = startupSchema.parse(input);
  const existing = await prisma.startup.findUnique({ where: { id } });
  if (!existing || existing.founderId !== founderId) throw new Error('Not found');
  return prisma.startup.update({
    where: { id },
    data: {
      ...data,
      location: data.location ?? null,
      website: data.website || null,
      fundingGoal: data.fundingGoal ?? null,
      traction: data.traction ?? null,
    },
  });
}

export function getStartup(id: string) {
  return prisma.startup.findUnique({
    where: { id },
    include: {
      founder: { include: { profile: true } },
      interests: { include: { investor: { include: { profile: true } } } },
    },
  });
}

export type StartupFilters = {
  q?: string;
  category?: string;
  stage?: StartupStage;
  minFunding?: number;
  maxFunding?: number;
};

export function listStartups(filters: StartupFilters = {}, take = 30) {
  const where: Prisma.StartupWhereInput = {};
  if (filters.category) where.category = filters.category;
  if (filters.stage) where.stage = filters.stage;
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q } },
      { tagline: { contains: filters.q } },
      { description: { contains: filters.q } },
    ];
  }
  if (filters.minFunding || filters.maxFunding) {
    where.fundingGoal = {};
    if (filters.minFunding) where.fundingGoal.gte = filters.minFunding;
    if (filters.maxFunding) where.fundingGoal.lte = filters.maxFunding;
  }
  return prisma.startup.findMany({
    where,
    include: { founder: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take,
  });
}

export async function expressInterest(
  investorId: string,
  startupId: string,
  note?: string,
) {
  const startup = await prisma.startup.findUnique({ where: { id: startupId } });
  if (!startup) throw new Error('Startup not found');

  const interest = await prisma.pitchInterest.upsert({
    where: { startupId_investorId: { startupId, investorId } },
    create: { startupId, investorId, note: note ?? null },
    update: { note: note ?? null },
  });

  await prisma.notification.create({
    data: {
      userId: startup.founderId,
      type: 'PITCH_INTEREST',
      payload: JSON.stringify({ startupId, investorId }),
    },
  });

  return interest;
}
