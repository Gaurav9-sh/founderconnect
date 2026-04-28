import { connectDB } from '@/lib/db';
import { Startup, PitchInterest, Notification } from '@/models';
import { startupSchema } from '@/lib/validation';
import type { StartupStage } from '@/lib/enums';
import type {
  StartupWithFounder,
  StartupListItem,
} from '@/types/models';

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function createStartup(founderId: string, input: unknown) {
  await connectDB();
  const data = startupSchema.parse(input);
  return Startup.create({
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
  });
}

export async function updateStartup(
  founderId: string,
  id: string,
  input: unknown,
) {
  await connectDB();
  const data = startupSchema.parse(input);
  const existing = await Startup.findById(id);
  if (!existing || existing.founderId !== founderId) throw new Error('Not found');
  Object.assign(existing, {
    ...data,
    location: data.location ?? null,
    website: data.website || null,
    fundingGoal: data.fundingGoal ?? null,
    traction: data.traction ?? null,
  });
  await existing.save();
  return existing;
}

export async function getStartup(
  id: string,
): Promise<StartupWithFounder | null> {
  await connectDB();
  const doc = await Startup.findById(id)
    .populate({ path: 'founder', populate: { path: 'profile' } })
    .populate({
      path: 'interests',
      populate: { path: 'investor', populate: { path: 'profile' } },
    })
    .lean({ virtuals: true });
  return doc as unknown as StartupWithFounder | null;
}

export type StartupFilters = {
  q?: string;
  category?: string;
  stage?: StartupStage;
  minFunding?: number;
  maxFunding?: number;
};

export async function listStartups(filters: StartupFilters = {}, take = 30) {
  await connectDB();
  const where: Record<string, unknown> = {};
  if (filters.category) where.category = filters.category;
  if (filters.stage) where.stage = filters.stage;
  if (filters.q) {
    const re = new RegExp(escapeRegex(filters.q), 'i');
    where.$or = [{ name: re }, { tagline: re }, { description: re }];
  }
  if (filters.minFunding || filters.maxFunding) {
    const range: Record<string, number> = {};
    if (filters.minFunding) range.$gte = filters.minFunding;
    if (filters.maxFunding) range.$lte = filters.maxFunding;
    where.fundingGoal = range;
  }
  const docs = await Startup.find(where)
    .sort({ createdAt: -1 })
    .limit(take)
    .populate({ path: 'founder', select: 'name' })
    .lean({ virtuals: true });
  return docs as unknown as StartupListItem[];
}

export async function expressInterest(
  investorId: string,
  startupId: string,
  note?: string,
) {
  await connectDB();
  const startup = await Startup.findById(startupId);
  if (!startup) throw new Error('Startup not found');

  const interest = await PitchInterest.findOneAndUpdate(
    { startupId, investorId },
    { $set: { note: note ?? null }, $setOnInsert: { startupId, investorId } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await Notification.create({
    userId: startup.founderId,
    type: 'PITCH_INTEREST',
    payload: JSON.stringify({ startupId, investorId }),
  });

  return interest;
}
